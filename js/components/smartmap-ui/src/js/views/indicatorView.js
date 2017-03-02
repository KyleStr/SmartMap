/* global wNumb, initDropdown */
define([
    'dojo/promise/all',
    'dojo/_base/lang',
    'dojo/on',
    '../collections/indicatorsCollection',
    'dojo/text!../templates/indicatorDisplayTemplate.html',

  ],
  function(all, lang, on, IndicatorsCollection, indicatorDisplayTemplate) {
    var IndicatorView = Backbone.View.extend({

      // Constants for queries.
      CATEGORY: 1,
      SUBTYPE: 3,
      VARIABLE: 4, // or Indicator

      // Holds all indicators available.
      // collection: -(Collection)

      // List of categories from where we get
      // descriptions and names.
      // allCategories: (Collection)

      // country and admin level.
      region: {},

      // Controls for this indicator.
      controls: {},

      // Categories available for the selected country
      // and admin level.
      categories: [],

      // Holds the selected indicator.
      // Corresponds to the lowest level in the selection process
      // (Category > subtype > indicator).
      // This is used once the modal is closed to render the indicator,
      // and to notify the parent.
      model: null,

      // Data for the indicator. set with renderDisplay()
      filterData: {},

      // The category to which this indicator belongs
      indicatorCat: null,

      // Amount of selected indicators.
      selectedIndicatorsCount: null,

      initialize: function(options) {
        this.allCategories = options.allCategories;
        this.region = options.region;
        this.controls = {};
        this.categories = [];
        this.selectedIndicatorsCount = options.selectedIndicatorsCount;

        this.countryIndicators = [];

        this.model = null;
        this.filterData = {};

        this.indicatorCat = null;

        this.addIndicatorFlagValue = options.addIndicatorFlagValue;

        var categories = Smartmap.getCategories(this.region.country, this.region.admin, {
          categoryLevel: this.CATEGORY
        });

        categories.then(lang.hitch(this, function(results) {
          // console.log('IndicatorView F:initialize');
          this.categories = Smartmap.processCategories(this.CATEGORY, results.features, this.allCategories);
          if (  this.addIndicatorFlagValue === true) {
            this.indicatorLib().then(lang.hitch(this, function(){
              this.renderDisplay();
            }));
          }
        }), function(error) {
          console.error(error);
        });
      },

      render: function(filterData, selectedIndicator, indicatorCat){
        this.indicatorLib().then(lang.hitch(this, function(){
          this.renderDisplay(filterData, selectedIndicator, indicatorCat);
        }));
      },

      indicatorLib: function(){

        var promise = new $.Deferred();
        // Use admin level one since all the categories are the same.
        var categories = Smartmap.getCategories(this.region.country, 1, {
          categoryLevel: this.CATEGORY
        });

        var allIndicators = Smartmap.getIndicators(this.region.country, 1);

        all([categories, allIndicators]).then(lang.hitch(this, function(results) {
          var categoriesProc = Smartmap.processCategories(this.CATEGORY, results[0].features, this.allCategories);

          // Process the indicators creating a collection.
          this.countryIndicators = new IndicatorsCollection();
          _.each(results[1].features, lang.hitch(this, function(feature) {
            this.countryIndicators.add(feature.attributes);
          }));

          promise.resolve();

        }), function(error) {
          console.error(error);
          promise.reject(error);
        });

        return promise;

      },



      renderDisplay: function(filterData, selectedIndicator, indicatorCat) {

        this.model = selectedIndicator;
        this.indicatorCat = indicatorCat;

        this.filterData.min = Math.floor(_.min(filterData));
        this.filterData.max = Math.ceil(_.max(filterData));
        this.filterData.useDecimals = this.filterData.max - this.filterData.min <= 2;


        var field = this.model.get('FIELD_NM');

        var indicator = this.countryIndicators.findWhere({
          FIELD_NM: field
        });

        // var dataSource = this.countryIndicators.findWhere({
        //   FIELD_NM: field
        // }).get('SRC1');


        var template = _.template(indicatorDisplayTemplate);

        this.setElement(template({
          indicatorName: this.model.get(SmartmapUI.analyticsController.SHORT_DESCRIPTION),
          indicatorUnit: this.model.get(SmartmapUI.analyticsController.UNITS),
          category : this.indicatorCat,
          indicator: indicator
        }));

        this.initControlsDisplay();

        // Manually execute change the slider change handler the first time
        // to set the values. When the slider is initialized the values
        // are not set.
        this.indicatorSlider_ChangeHandler();

        $('[data-loading-indicator]').removeClass('revealed');

      },

      initControlsDisplay: function() {


        this.controls.indicatorSlider = this.$el.find('.indicator-slider');
        this.controls.indicatorValMin = this.$el.find('.indicator-min');
        this.controls.indicatorValMax = this.$el.find('.indicator-max');
        this.controls.remove = this.$el.find('.indicator-remove');
        this.controls.info = this.$el.find('.indicator-info');

        this.controls.indicatorSlider.noUiSlider({
          start: [this.filterData.min, this.filterData.max],
          step: this.filterData.useDecimals ? 0.1 : 1,
          connect: true,
          range: {
            'min': this.filterData.min,
            'max': this.filterData.max
          },
          format: wNumb({
            decimals: this.filterData.useDecimals ? 1 : 0,
          })
        });

        this.controls.indicatorSlider.noUiSlider_pips({
          density: 8,
          mode: 'positions',
          values: [0, 100],
          // Format to add labels to the axes (600K or 6M)
          format: {
            from: function(a) {
              var results = a.match(new RegExp('^[0-9]+(M|K)$'));
              if (results) {
                if (results[1] === 'M') {
                  return a * 1E6;
                } else if (results[1] === 'K') {
                  return a * 1E3;
                }
              }
              return a;
            },
            to: function(a) {
              if (a >= 1E6) {
                return Math.round(a / 1E6) + 'M';
              } else if (a >= 1E3) {
                return Math.round(a / 1E3) + 'K';
              }
              return Math.round(a);
            }
          }
        });

        // Global function to init all the dropdown.
        // Each dropdown is only initilaized once.
        initDropdown();
        this.addEventHandlersDisplay();
      },

      addEventHandlersDisplay: function() {

        var shake = function(el) {
          el.removeClass('invalid');
          setTimeout(function() {
            el.addClass('invalid');
          }, 10);
        };

        var minControl = this.controls.indicatorValMin;
        minControl.change(lang.hitch(this, function(e) {
          var val = parseInt(e.target.value);
          if (isNaN(val) || val < this.filterData.min || val > this.filterData.max) {
            shake(minControl);
            // Put back the original value.
            this.indicatorSlider_SlideHandler();
          } else {
            // Valid value. Update slider.
            this.controls.indicatorSlider.val([val, null]);
          }
        }));

        var maxControl = this.controls.indicatorValMax;
        maxControl.change(lang.hitch(this, function(e) {
          var val = parseInt(e.target.value);
          if (isNaN(val) || val < this.filterData.min || val > this.filterData.max) {
            shake(maxControl);
            // Put back the original value.
            this.indicatorSlider_SlideHandler();
          } else {
            // Valid value. Update slider.
            this.controls.indicatorSlider.val([null, val]);
          }
        }));

        this.controls.indicatorSlider.on('set', lang.hitch(this, this.indicatorSlider_ChangeHandler));
        this.controls.indicatorSlider.on('slide', lang.hitch(this, this.indicatorSlider_SlideHandler));

        this.controls.remove.click(lang.hitch(this, this.indicatorRemove_evHandler));
        this.controls.info.click(lang.hitch(this, this.indicatorInfo_evHandler));

        // Force value update.
        this.indicatorSlider_SlideHandler();
      },


      /**
       * Event Handlers
       */


      indicatorSlider_ChangeHandler: function() {
        // console.log('IndicatorView F:indicatorSlider_ChangeHandler');
        var values = this.controls.indicatorSlider.val();
        this.model.set('minForFilter', this.filterData.useDecimals ? parseFloat(values[0]) : parseInt(values[0]));
        this.model.set('maxForFilter', this.filterData.useDecimals ? parseFloat(values[1]) : parseInt(values[1]));

        this.trigger('simpleUpdateMap');
      },

      indicatorRemove_evHandler: function(e) {
        // console.log('IndicatorView F:indicatorRemove_evHandler');
        e.preventDefault();
        this.trigger('indicatorRemove', this);
      },

      indicatorInfo_evHandler: function(e) {
        // console.log('IndicatorView F:indicatorInfo_evHandler');
        e.preventDefault();
        window.indicatorLibView.open(this.region.country, this.indicatorCat, this.model.get('FIELD_NM'));
      },

      indicatorSlider_SlideHandler: function() {
        var values = this.controls.indicatorSlider.val();

        this.controls.indicatorValMin.val(values[0]);
        this.controls.indicatorValMax.val(values[1]);
      },

      /**
       * Utilities
       */


      cleanup: function() {
        // Remove this view
        this.remove();
      }

    });
    return IndicatorView;
  });
