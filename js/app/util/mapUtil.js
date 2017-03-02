define([
    'dojo/_base/declare'
  ],

  function(declare) {
    var mapUtil = declare(null, {
      map: null,

      constructor: function(options) {
        this.map = options.map;
      },

      setTools: function(tools) {
        this.scalebar = tools.scalebar;
        this.locator = tools.locator.geocoder;
        this.homeButton = tools.homeButton.homeButton;
      },

      /**
       * Use this method to add layers to the map
       * @param  {array} layers Array of layers to be added to the map
       * @param  {Number} Position in the map to add layer (only works with a single layer)
       * @return { }        None
       */
      addLayers: function(layers, pos) {
        if (layers.length > 1) {
          this.map.addLayers(layers);
        } else {
          this.map.addLayer(layers[0], pos);
        }
      },

      /**
       *  Use this method to remove a single layer from the map
       *  @param {Layer} layer An instantiated layer object to be removed from the map
       *  @return { } None
       */
      removeLayer: function(layer) {
        this.map.removeLayer(layer);
      },

      /**
       *  Use this method to remove a layer from the map by layer id
       *  @param  {string} layerId an id of a layer currently on the map
       *  @return { }         None
       */
      removeLayerById: function(layerId) {
        this.map.removeLayer(this.map.getLayer(layerId));
      },

      /**
       * Use this method to reorder a layer on the map
       * @param  {String} layerId layerId of a layer currently on the map
       * @param  {Number} position   Desired position of the layer
       * @return { }         None
       */
      reorderLayer: function(layerId, position) {
        this.map.reorderLayer(layerId, position);
      },

      /**
       *  Use this method to center the map on a particular extent.
       *  @param {Extent} newExtent an esri/geometry/extent object
       *  @return { }         None
       */
      setExtent: function(newExtent) {
        this.map.setExtent(newExtent, true);
      },

      zoomToHome: function() {
        this.homeButton.home();
      },

      /**
       * Shows the popup with the selected graphic
       */
      setPopup: function(graphic) {
        this.map.infoWindow.setFeatures([graphic]);
        var anchorGeometry = null;
        switch (graphic.geometry.type) {
          /* jshint ignore:start */
          case 'polygon':
            anchorGeometry = graphic.geometry.getCentroid();
            break;
          case 'point':
            anchorGeometry = graphic.geometry;
            break;
          case 'extent':
            anchorGeometry = graphic.geometry.getCenter();
            break;
          default:
            anchorGeometry = graphic.geometry.getExtent().getCenter();
          /* jshint ignore:end */
        }
        this.map.infoWindow.show(anchorGeometry);
        if (!this.map.extent.contains(anchorGeometry)) {
          this.map.centerAt(anchorGeometry);
        }
      },

      /**
       * Hides any open popups/info windows
       */
      hidePopups: function() {
        this.map.graphics.clear();
        this.map.infoWindow.hide();
      }
    });

    return mapUtil;
  });
