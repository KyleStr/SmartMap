/* global app:true */

define([
    'config/config',
    'app/views/layoutView',

    'components/smartmap-ui/release/smartmap-ui',
    'components/homeButton/views/homeButtonView',
    'components/locator/views/locatorView',
    'components/report/reportController',
    'app/util/mapUtil',

    'esri/config',
    'esri/tasks/GeometryService',
    'esri/map',
    'esri/geometry/Extent',
    'esri/dijit/Scalebar',

    'dojo/_base/lang',
  ],

  function(config, Layout,
    SmartmapUI, HomeButton, Locator, ReportController, MapUtil,
    esriConfig, GeometryService, Map, Extent, Scalebar, lang) {
    return {
      /**
       * This is the entry point for the application, called from index.html
       */
      startup: function() {
        app = this;
        this.initConfig();
        this.initLayout();
      },

      /**
       * Initialize esri configuration settings
       */
      initConfig: function() {
        this.config = config;
        esriConfig.defaults.geometryService = new GeometryService(config.geometryService.url);
        esriConfig.defaults.io.proxyUrl = config.proxy.url;
        esriConfig.defaults.io.alwaysUseProxy = config.proxy.alwaysUseProxy;
      },

      /**
       * Initialize the application layout by inserting top level nodes into the DOM
       */
      initLayout: function() {
        this.layout = new Layout({
          el: $('#site-canvas'),
          config: this.config,
        });

        this.layout.render();

        this.initMap();
        this.initSmartMapUi();
      },

      /**
       * Initialize the map and place it in 'mapContainer'
       */
      initMap: function() {
        // mapContainer is in the layout.
        this.map = new Map('mapContainer', {
          basemap: this.config.basemap,
          extent: new Extent(this.config.extent)
        });

        this.initMiscUtils();
      },

      /**
       * Initialize any other pieces of the app
       */
      initMiscUtils: function() {
        this.mapUtil = new MapUtil({
          map: this.map
        });

        // Configure smartmap api
        Smartmap.configure({
          'helper': 'jquery',
          'serviceUrl': this.config.smartmapServiceUrl
        });
        this.initComponents();
      },

      /**
       * Initialize components of the application, this is the last responsibility of the Controller
       */
      initComponents: function() {

        // Esri Widgets
        this.scalebar = new Scalebar({
          map: this.map,
          scalebarUnit: 'dual'
        });

        this.locator = new Locator({
          map: this.map
        });

        this.homeButton = new HomeButton({
          map: this.map,
          extent: this.map.extent
        });

        // Add map tools to mapUtil
        this.mapUtil.setTools({
          scalebar: this.scalebar,
          locator: this.locator,
          homeButton: this.homeButton
        });

        this.reportController = new ReportController({
          map: this.map
        });

      },

      /**
       * Initialize the SmartmapUI component
       */
      initSmartMapUi: function() {

        // The smartmapUi should create its own container.
        // This will then be added at will.
        this.analytics = new SmartmapUI({
          map: this.map,
          //el: '#analyticsContainer'
          showBtns: {
            report: true
          }
        });
        this.layout.$el.find('#smartMapUiView').html(this.analytics.container);
      }
    };
  }
);
