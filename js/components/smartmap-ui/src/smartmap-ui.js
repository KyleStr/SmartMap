/**
 * This is the AMD Module to require if you want to use smartmap-ui. It will
 * bootstrap everything required to use smartmap-ui in your app.
 */

define([
  'dojo/_base/declare',
  './js/controllers/analytics'

], function(declare, Analytics) {

  var SmartmapUI = declare(null, {
    
    container : null,
    
    options: {
      showBtns: {
        report: false
      }
    },

    constructor: function(options) {
      this.options = $.extend(true, this.options, options);

      this.map = options.map;
      //this.el = options.el;
      this.startup();
    },

    startup: function() {
      // Create the container that will hold everything related.
      this.container = $('<section id="smartmap-ui" class="smartmap-ui smpanel">');
      var that = this;
      
      var SmartmapUI = {};
      window.SmartmapUI = SmartmapUI;

      // Version
      SmartmapUI.version = '0.1.0';

      // Default Config
      SmartmapUI.config = this.setConfig();

      /**
       * Public Event List
       */

      // smartmapUI/layer-updated
      // smartmapUI/def-expr-set

      SmartmapUI.analyticsController = new Analytics({
        map: this.map,
        el: this.container,
        showBtns : this.options.showBtns
      });
    },

    setConfig: function() {
      return {
        nxMaxIndicators: 5,
        analyticsRenderer: {
          'type': 'simple',
          'label': '',
          'description': '',
          'symbol': {
            'type': 'esriSFS',
            'style': 'esriSFSSolid',
            'color': [255, 170, 0, 100],
            'outline': {
              'type': 'esriSLS',
              'style': 'esriSLSSolid',
              'color': [168, 112, 0, 255],
              'width': 0.25
            }
          }
        },

        // Popover help content, should be extracted to some other file but putting here to find later...
        nls: {
          analytics: {
            countrySelect: {
              title: 'Choose a Country',
              help: 'Please select a country and the level you would like to analyze.'
            },
            indicatorGroup: {
              title: 'Indicators and Ranges',
              help: 'Please select <strong>1 to 5</strong> indicators. You may also define a range for each indicator by clicking the filter button.'
            },
            updateMap: {
              title: 'Update Map',
              help: 'Once you have selected some indicators, click the Update Map button to see the results of your analysis.'
            }
          },
          layersAndWebmaps: {
            layers: {
              title: 'Layers',
              help: 'Toggle layers on the map.'
            },
            webmaps: {
              title: 'Webmaps',
              help: 'Add and remove webmap layers.'
            }
          }
        }
      };
    }
  });
  return SmartmapUI;
});
