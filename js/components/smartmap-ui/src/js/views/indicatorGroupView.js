/* global initScrollable */
define([
    'dojo/promise/all',
    'dojo/_base/lang',
    'dojo/topic',

    'esri/tasks/FeatureSet',

    'dojo/text!../templates/indicatorGroupViewTemplate.html',
    '../collections/indicatorsCollection',
    '../collections/categoriesCollection',
    './indicatorView',
    './IndicatorSelectView'
  ],

  function(all, lang, topic, FeatureSet, viewTemplate, IndicatorsCollection, CategoriesCollection, IndicatorView, IndicatorSelectView) {
    var IndicatorGroupView = Backbone.View.extend({

      map: null,

      // model: Analytics model from parent

      // Will hold all the indicators.
      collection: new IndicatorsCollection(),

      // The selected indicators. When an indicator is selected
      // is moved from collection to here and vice versa.
      selectedIndicators: new IndicatorsCollection(),

      // List of categories from where we get
      // descriptions and names.
      allCategories: new CategoriesCollection(),

      // Array of indicatorViews.
      subviews: [],

      initialize: function(options) {
        this.map = options.map;
        this.analyticsLayer = options.analyticsLayer;

        this.collection = new IndicatorsCollection();
        this.selectedIndicators = new IndicatorsCollection();
        this.allCategories = new CategoriesCollection();
        this.subviews = [];

        this.addIndicatorFlagValue = true;

        this.render();
        this.startup();
      },

      render: function() {
        var template = _.template(viewTemplate);

        // Render the view template.


        var templateResult = template({
          hasIndicators: this.selectedIndicators.length > 0,
        });

        // Covert to jquery object.
        templateResult = $(templateResult);

        // Append each one of the subviews.
        _.each(this.subviews.reverse(), function(subview) {
          templateResult.find('.content').append(subview.$el);
        });

        // Set as view element.
        this.$el.html(templateResult);

        if (this.addIndicatorFlagValue === true) {
          this.$el.find('.content').css({display: 'none'});
        }
        else {
          this.$el.find('.content').css({display: 'block'});
        }


        // Scrollables.
        // initScrollable();
      },

      startup: function() {
        var country = this.model.get('country').get(SmartmapUI.analyticsController.COUNTRY_ISO),
          admin = this.model.get('adminLevel').get('value');

        // getAllCategories will return a list of categories from where we get
        // descriptions and names.
        var allCategories = Smartmap.getAllCategories();
        // getIndicators will return a list with all the indicators available
        // for the country and admin level. From this we'll also extract the
        // names and descriptions
        var indicators = Smartmap.getIndicators(country, admin);
        // Features are used to build the analytics layer for the map.
        this.featureRequest = Smartmap.getFeatures(country, admin);
        this.featureRequest.then(lang.hitch(this, this.addFeaturesToAnalyticsLayer));

        all([indicators, allCategories]).then(lang.hitch(this, function(results) {
          this.setIndicators(results[0]);
          this.allCategories.reset(_.pluck(results[1].features, 'attributes'));

          // Inform the parent that the category load is complete.
          // This is needed because the indicators can only be added once
          // the categories have been loaded.
          this.trigger('indicatorLoadComplete');
        }), function(error) {
          console.error(error);
        });
      },

      // Adds an array of indicators to an IndicatorsCollection
      setIndicators: function(results) {
        var indicatorsArr = [];
        _.each(results.features, function(feature) {
          indicatorsArr.push(feature.attributes);
        });

        this.collection.reset(indicatorsArr);
      },


      addIndicator: function(event) {
        // console.log('indicatorGroupView  F:addIndicator');
        // console.log('All indicators', this.collection.toJSON());
        // console.log('All Categories', this.allCategories.toJSON());



        if (this.selectedIndicators.length >= SmartmapUI.analyticsController.MAX_INDICATORS) {
          console.log('Indicator limit reached. Not possible to add more.');
          return;
        }

        // if(this.IndicatorSelect){
        //   this.IndicatorSelect.cleanup();
        // }



        this.IndicatorSelect = new IndicatorSelectView({
          el: this.$el.find('#selectIndicatorViews'),
          collection: this.collection,
          allCategories: this.allCategories,
          selectedIndicatorsCount: this.selectedIndicators.length,
          region: {
            country: this.model.get('country').get(SmartmapUI.analyticsController.COUNTRY_ISO),
            admin: this.model.get('adminLevel').get('value'),
          }
        });

        this.IndicatorSelect.on('indicatorSelectionFinished', this.indicatorSelectionFinished_evHandler, this);
      },

      addIndicatorFlag: function(value){
        this.addIndicatorFlagValue = value;
      },

      removeIndicator: function(indicatorView) {
        // Move the indicator from slectedIndicators to the list with all.
        this.swapModel(indicatorView.model, this.selectedIndicators, this.collection);
        // Remove indicator from subviews.
        this.subviews = _.without(this.subviews, indicatorView);
        // Remove indicatorView.
        indicatorView.remove();

        console.log('se removió el indicador');

        // Re render IndicatorGroupView.
        this.render();

        // Update map.
        this.updateGraphicsLayer();

        this.trigger('indicatorRemoved');
      },


      /**
       * Event Handlers
       */

      // Sets the current 'indicator' model for Analytics.
      // Also swaps the indicator from 'indicators' to 'selectedIndicators'
      indicatorSelectionFinished_evHandler: function(selectedIndicator, indicatorView, indicatorCat, view) {
        if (!this.currentFeatures) {
          this.once('regionLoadComplete', function() {
            this.indicatorSelectionFinished_evHandler(selectedIndicator, indicatorView, indicatorCat, view);
          }, this);
          return;
        }
        var filterData = this.getValidValues(selectedIndicator);
        // console.log('IndicatorGroupView F:indicatorSelectionFinished_evHandler filterData', filterData);

        if (!filterData.length) {
          var layerName = this.model.get('country').get('CNTRY_ISO') + '_' + this.model.get('adminLevel').get('value');
          console.error(selectedIndicator.get(SmartmapUI.analyticsController.FIELD_NAME) + ' field does not exist in the layer: ' + layerName);
          window.alert('This indicator ' + selectedIndicator.get(SmartmapUI.analyticsController.SHORT_DESCRIPTION) + ' returned no data. There may be a problem with the SmartMap Service.');
          return;
        }

        // Swap indicator from main collection to 'selected' collection
        this.swapModel(selectedIndicator, this.collection, this.selectedIndicators);

        view.render(filterData, selectedIndicator, indicatorCat);

        $('[data-loading-indicator]').addClass('revealed');

        view.indicatorLib().then(lang.hitch(this, function(){
          view.renderDisplay(filterData, selectedIndicator, indicatorCat);
          this.subviews.push(view);
          this.updateGraphicsLayer();
          console.log(this.subviews);
          console.log('se añadió el indicador');

          this.addIndicatorFlag(false);
          // Re render IndicatorGroupView.
          this.render();

          this.trigger('indicatorAdded');
        }));

        view.on('simpleUpdateMap', this.updateGraphicsLayer, this);
        view.on('indicatorRemove', this.removeIndicator_evHandler, this);

        // this.subviews.push(view);
        // this.updateGraphicsLayer();

        // After getting the filter data render the indicator.
        // Pass the filter data.

        // Add as a subview for IndicatorGroupView.



      },

      removeIndicator_evHandler: function(indicatorView) {
        // console.log('IndicatorGroupView F:removeIndicator_evHandler');
        this.removeIndicator(indicatorView);
      },

      // Transfer a model from one collection to another
      swapModel: function(model, from, to) {
        var m = from.remove(model);
        to.add(model);
        to.sort();
      },

      cleanup: function() {
        // Destroy both collections
        this.collection.reset();
        this.collection = null;
        this.selectedIndicators.reset();
        this.selectedIndicators = null;
        this.allCategories.reset();
        this.allCategories = null;

        // Update the graphics layer before destroying the rest.
        this.updateGraphicsLayer();
        this.analyticsLayer.setVisibility(false);

        if (this.featureRequest.state() === 'pending') {
          this.featureRequest.reject();
        }

        // Tell indicatorViews to cleanup
        _.each(this.subviews, function(subview) {
          subview.cleanup();
        });

        this.subviews = [];

        // Remove this view
        this.remove();
      },

      addFeaturesToAnalyticsLayer: function(featureCollection) {
        // Check for actual features in the featureCollection
        if (featureCollection && featureCollection.features && this.model.get('adminLevel')) {
          var dataChecker = {},
            featureSet;

          featureSet = new FeatureSet({
            geometryType: featureCollection.geometryType,
            spatialReference: featureCollection.spatialReference,
            features: featureCollection.features
          });

          _.each(featureSet.features, function(feature) {
            // Make sure this isn't a duplicate feature
            if (dataChecker[feature.attributes[SmartmapUI.analyticsController.GOV_CODE]]) {
              console.warn(SmartmapUI.analyticsController.GOV_CODE + ' ' + feature.attributes[SmartmapUI.analyticsController.GOV_CODE] + ' already exists! ');
            } else {
              // If not a duplicate, add it to dataChecker and our graphicsLayer
              dataChecker[feature.attributes[SmartmapUI.analyticsController.GOV_CODE]] = true;
              this.analyticsLayer.add(feature);
            }
          }, this);

          var admLevNum = this.model.get('adminLevel').get('value'),
            title;

          if (admLevNum === '1') {
            title = '${' + SmartmapUI.analyticsController.ADM_1_NAME + '}';
          } else {
            title = '${' + SmartmapUI.analyticsController.ADM_2_NAME + '}, ${' + SmartmapUI.analyticsController.ADM_1_NAME + '}';
          }

          this.analyticsLayer.infoTemplate.title = title;
          this.analyticsLayer.infoTemplate.content = lang.hitch(this, this.setInfoWindowContent);
          this.currentFeatures = _.clone(this.analyticsLayer.graphics);
          // this.toggleBlockingDiv(false);

        } else {
          console.error('no features were returned' + featureCollection);
        }
        this.trigger('regionLoadComplete');
      },

      // Creates an array of valid values from this.currentFeatures for the
      // current indicator. Performs some validation first.
      getValidValues: function(indicator) {
        var fieldName = indicator.get(SmartmapUI.analyticsController.FIELD_NAME);
        var features = this.currentFeatures;
        var dataArr = [];
        dataArr = _.chain(features)
          .filter(function(graphic) {
            var valueShortcut = graphic.attributes[fieldName];
            // Validate the value is a number and is finite
            return !isNaN(parseFloat(valueShortcut)) && isFinite(valueShortcut);
          })
          .map(function(graphic) {
            return graphic.attributes[fieldName];
          })
          .value();
        return dataArr;
      },

      updateGraphicsLayer: function() {

        if (this.selectedIndicators && this.selectedIndicators.length) {
          // Add attributes to appropriate feature layer
          this.filteredGraphics = _.map(this.currentFeatures, function(graphic) {
            return graphic;
          });
          var filters = this.selectedIndicators.map(function(indicator) {
            return {
              attribute: indicator.get(SmartmapUI.analyticsController.FIELD_NAME) || null,
              min: indicator.get('minForFilter'),
              max: indicator.get('maxForFilter')
            };
          }, this);

          // Filter the graphics down to only those that match current filters
          this.filteredGraphics = _.filter(this.filteredGraphics, function(graphic) {
            // Passes the predicate if all filters return true
            return _.every(filters, function(filters) {
              var value = graphic.attributes[filters.attribute];
              // If any of these are false, fail the predicate
              if (value === null || value > filters.max || value < filters.min) {
                return false;
              }
              return true;
            });
          });

          this.analyticsLayer.setVisibility(true);
          this.analyticsLayer.clear();
          _.each(this.filteredGraphics, function(graphic) {
            this.analyticsLayer.add(graphic);
          }, this);

          var admLevNum = this.model.get('adminLevel').get('value');
          var admLevLabel = this.model.get('adminLevel').get('label');
          this.publishDefExprResults(this.selectedIndicators, admLevNum, admLevLabel, this.filteredGraphics, this.analyticsLayer);
          this.broadcastRegionCount(this.filteredGraphics.length, this.currentFeatures.length);
        } else {
          // No indicators selected, clearing graphics layer
          this.analyticsLayer.clear();
          this.broadcastRegionCount(0, this.currentFeatures ? this.currentFeatures.length : 0);
        }

        // this layer update often causes the selected feature to no longer be in the filteredGraphics set.
        // Instead of figuring out whether or not that's the case, just close the popup.
        this.map.infoWindow.clearFeatures();
        this.map.infoWindow.hide();
        this.map.graphics.clear();

        topic.publish('smartmapUI/layer-updated', {
          layer: this.analyticsLayer
        });
      },

      /**
       * Custom formatter for analyticsLayer's InfoTemplate - displays currently selected indicators
       * @param  {Graphic}        graphic Automatically passed as an argument by the JSAPI
       * @return {String}         String of text/html to populate the content area of an InfoTemplate
       */
      setInfoWindowContent: function(graphic) {
        var val,
          units,
          content = '',
          indicators = this.selectedIndicators,
          indicatorName = '';

        if (indicators) {
          indicators.each(function(indicator) {
            val = graphic.attributes[indicator.get(SmartmapUI.analyticsController.FIELD_NAME)];
            units = indicator.get(SmartmapUI.analyticsController.UNITS);
            indicatorName = indicator.get(SmartmapUI.analyticsController.SHORT_DESCRIPTION);


            // Set content of the indicator row
            content += '<dt title="' + indicatorName + '">' + indicatorName + '</dt><dd>' + val + ' <sup>' + units + '</sup></dd>';
          }, this);
          content = '<dl class="results-details">' + content + '</dl>';
        }

        return content;
      },

      publishDefExprResults: function(indicatorCollection, admLevelNum, admLevLabel, graphicsArr, fLayer) {
        var args = {
          indicatorCollection: indicatorCollection,
          admLevelNum: admLevelNum,
          admLevLabel: admLevLabel,
          graphicsArr: graphicsArr,
          fLayer: fLayer
        };
        topic.publish('smartmapUI/def-expr-set', args);
      },

      broadcastRegionCount: function(selectedCount, totalCount) {
        var args = {
          selectedCount: selectedCount,
          totalCount: totalCount
        };
        this.trigger('selectCountChanged', args);
        topic.publish('smartmapUI/selected-count');
      }
    });

    return IndicatorGroupView;
  });
