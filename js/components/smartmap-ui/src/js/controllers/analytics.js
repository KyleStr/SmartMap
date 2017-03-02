/* global Smartmap */
define([
    '../util/mapUtil',

    '../models/analyticsModel',
    '../views/analyticsView',
    '../views/modalView',
    'dojo/text!../templates/welcomeModalTemplate.html',

    'esri/tasks/FeatureSet',
    'esri/layers/FeatureLayer',
    'esri/layers/ArcGISDynamicMapServiceLayer',
    'esri/layers/GraphicsLayer',
    'esri/layers/LayerDrawingOptions',
    'esri/graphic',
    'esri/InfoTemplate',
    'esri/renderers/SimpleRenderer',

    'dojo/_base/declare',
    'dojo/on',
    'dojo/_base/lang',
    'dojo/topic',
    'dojo/promise/all',
  ],

  function(MapUtil,
    AnalyticsModel, AnalyticsView, ModalView, welcomeModalTemplate,
    FeatureSet, FeatureLayer, ArcGISDynamicMapServiceLayer, GraphicsLayer, LayerDrawingOptions, Graphic, InfoTemplate, SimpleRenderer,
    declare, on, lang, topic, all) {

    var AnalyticsViewController = declare(null, {

      // Passed to the constructor, the element that will hold everything.
      el : null,

      // CONSTANTS
      ISO: 'ISO',
      UNITS: 'UNITS',
      GOV_CODE: 'CODGOV',
      ADM_1_NAME: 'NAME_1',
      ADM_2_NAME: 'NAME_2',
      FIELD_NAME: 'FIELD_NM',
      COUNTRY_ISO: 'CNTRY_ISO',
      COUNTRY_NAME: 'CNTRY_NM',
      SHORT_DESCRIPTION: 'DESC_SHORT',
      ADM_1_LOCAL_NAME: 'ADM1_NM_LOC',
      ADM_1_EN_NAME: 'ADM1_NM_EN',
      ADM_1_AVAILABLE: 'AVAIL_ADM1',
      ADM_2_LOCAL_NAME: 'ADM2_NM_LOC',
      ADM_2_EN_NAME: 'ADM2_NM_EN',
      ADM_2_AVAILABLE: 'AVAIL_ADM2',
      NOT_APPLICABLE: 'N/A',

      MAX_INDICATORS: 5,

      options: null,

      constructor: function(options) {
        this.options = options;
        this.map = options.map;
        this.el = options.el;
        this.startup();
      },

      /**
       * Initialization
       * ==============
       */
      startup: function() {
        // Map utils is used to connect with the map.
        this.mapUtil = new MapUtil({
          map: this.map
        });

        this.nullValueRenderer = this.constructNullValueRenderer();

        var lookup = Smartmap.getLookup();

        lookup.then(lang.hitch(this, function(response) {
          this.lookup = response;
          // Create empty layer definition array
          this.layerDefinitions = [];

          this.addMapLayers(this.map);

        }), function(error) {
          console.error('SmartMap getLookup failed', error);
        });
      },

      addMapLayers: function(map) {
        // add layers
        this.adm0Layer = new FeatureLayer(Smartmap.config.serviceUrl + '/0', {
          id: 'adm0Layer',
          name: 'ADM0',
          visible: false
        });

        this.adminLayer = new ArcGISDynamicMapServiceLayer(Smartmap.config.serviceUrl, {
          id: 'adminBase',
          visible: false
        });

        map.addLayers([this.adm0Layer, this.adminLayer]);

        // Once the layers are added we can load the analytics view
        // (a.k.a. floating box)
        map.on('layers-add-result', lang.hitch(this, function() {
          this.initializeLookups(lang.hitch(this, function(countries) {
            this.addView(this.el, this.map);
            this.view.constructCountryCollection(countries.features);
            this.renderWelcomeModal();
          }));
        }));
      },

      addView: function(el, map) {
        this.view = new AnalyticsView({
          model: new AnalyticsModel(),
          el: el,
          map: map,
          showBtns: this.options.showBtns
        });

        // Will take care of updating the map.
        this.view.model.on('change:country', this.country_ChangeHandler, this);
        this.view.model.on('change:adminLevel', this.adminLevel_ChangeHandler, this);
        this.view.subviews.countrySelectView.on('countryEdit', this.clearAdmin, this);
        // cannot attach to this.view.subviews.indicatorgroupview since it is not available on load
        this.view.on('indicatorAdded', this.updateNullValueFilter, this);
        this.view.on('indicatorRemoved', this.updateNullValueFilter, this);
      },

      constructNullValueRenderer: function() {
        return new SimpleRenderer({
          'type': 'simple',
          'symbol': {
            'type': 'esriSFS',
            'style': 'esriSFSBackwardDiagonal',
            'color': [127, 127, 127]
          }
        });
      },

      renderWelcomeModal: function() {
        var template = _.template(welcomeModalTemplate);
        var modalBody = template();
        var _self = this;

        var modal = new ModalView({
          size: 'medium',

          header: '<h1 class="modal-title">Welcome to SmartMap</h1>',
          body: modalBody,
          cancel: false,
          confirm: {
            text: 'Continue',
            title: 'Continue',
            classes: 'bttn-primary',
            onConfirm: function() {
              // this -> modal
              this.destroy();
              _self.view.subviews.countrySelectView.renderModal();
            }
          },
          closeOnClick: false,
        });

        // Display.
        // modal.show();
      },

      /**
       * Gets countries and categories
       */
      initializeLookups: function(cb) {
        var countries = Smartmap.getAllCountries(),
          categories = Smartmap.getAllCategories();

        all([countries, categories]).then(function(results) {
          cb(results[0], results[1]);
        }, function(error) {
          console.error(error);
        });
      },


      /**
       * Event Handlers
       */
      country_ChangeHandler: function(analyticsModel, countryModel) {
        // console.log('country_ChangeHandler');
        this.country = countryModel.get(this.COUNTRY_ISO);

        this.drawCountryLayer(this.country);
      },

      adminLevel_ChangeHandler: function(analyticsModel, adminModel) {
        this.adminLevel = parseInt(adminModel.get('value'));
        this.drawAdminLayer(this.country, this.adminLevel);
      },

      /**
       * Public Methods
       */

      /**
       * Draws the Country Layer based on a country model
       */
      drawCountryLayer: function(iso) {
        var whereExp = this.ISO + '=\'' + iso + '\'';

        Smartmap.getCountryFeatures([iso]).then(lang.hitch(this, function(response) {
          var featureSet = new FeatureSet({
            geometryType: response.geometryType,
            spatialReference: response.spatialReference,
            features: response.features
          });
          this.setAdminLayersVisible([{
            lyrNum: this.lookup.ADM0.id,
            whereExp: this.ISO + '=\'' + iso + '\''
          }]);

          this.currentExtent = featureSet.features[0].geometry.getExtent();
          this.resetExtent();
        }));

        if (this.analyticsLayer) {
          this.mapUtil.removeLayer(this.analyticsLayer);
        }
      },

      /**
       * Draws the Admin Layer based on an analyticsModel
       */
      drawAdminLayer: function(iso, adminLevel) {
        var countryRegionSublayerNum = this.lookup[iso + '_' + adminLevel].id;

        if (!this.adminLayer.drawingOptions || !this.adminLayer.drawingOptions[countryRegionSublayerNum]) {
          var drawOptions = this.adminLayer.drawingOptions || [];
          var ldo = new LayerDrawingOptions();
          ldo.renderer = this.nullValueRenderer;
          drawOptions[countryRegionSublayerNum] = ldo;
          this.adminLayer.setLayerDrawingOptions(drawOptions);
        }

        this.setAdminLayersVisible([{
          lyrNum: adminLevel,
          whereExp: this.ISO + '=\'' + iso + '\''
        }, {
          lyrNum: countryRegionSublayerNum,
          whereExp: '1=0'
        }]);

      },

      updateNullValueFilter: function() {
        var nullValueArr = this.view.subviews.indicatorGroupView.selectedIndicators.map(function(indicator) {
          return indicator.get('FIELD_NM') + ' is null';
        });
        if (!nullValueArr || !nullValueArr.length) {
          nullValueArr = ['1 = 0'];
        }
        // var newLayerDefs = this.adminLayer.layerDefinitions;
        this.adminLayer.layerDefinitions[this.lookup[this.country + '_' + this.adminLevel].id] = nullValueArr.join(' OR ');
        this.adminLayer.setLayerDefinitions(this.adminLayer.layerDefinitions);
      },


      /**
       * Utility Functions
       */

      /**
       * Makes a list of layers in adminLayer visible and sets definition expressions
       */
      setAdminLayersVisible: function(lyrWhereArr, add) {
        this.adminLayer.setVisibility(false);

        var newLayerDefs = [];
        var newVisibleLayers = [];
        if (add) {
          newLayerDefs = this.adminLayer.layerDefinitions;
          newVisibleLayers = this.adminLayer.visibleLayers;
        }

        _.each(lyrWhereArr, function(obj) {
          newLayerDefs[obj.lyrNum] = obj.whereExp;
          newVisibleLayers = _.union(newVisibleLayers, [obj.lyrNum]);
        });

        this.adminLayer.setVisibleLayers(newVisibleLayers);
        this.adminLayer.setLayerDefinitions(newLayerDefs);
        this.adminLayer.setVisibility(true);
        this.mapUtil.hidePopups();
      },

      resetExtent: function(newExtent) {
        if (newExtent) {
          this.mapUtil.setExtent(newExtent);
        } else {
          this.mapUtil.setExtent(this.currentExtent);
        }
      },

      clearAdmin: function() {
        this.adminLayer.setVisibility(false);
        this.adminLayer.setLayerDefinitions([]);
        this.adminLayer.setVisibleLayers([-1]);
      }

    });

    return AnalyticsViewController;
  });
