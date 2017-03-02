define([
    'dojo/text!../templates/selectionGridViewTemplate.html',
    'dgrid/Grid',
    'dgrid/Selection',
    'dojo/_base/declare',
    'esri/symbols/SimpleFillSymbol',
    'esri/symbols/SimpleLineSymbol',
    'esri/symbols/SimpleMarkerSymbol',
    'esri/tasks/query',
    'dojox/layout/ExpandoPane',
    'dojo/number',
    'dojo/on',
    'dojo/_base/lang',
    'dojo/topic',
    'dojo/_base/event',
    'dijit/registry',
    'dojo/domReady!'
  ],

  function(viewTemplate, Grid, Selection, declare, SFS, SLS, SMS, esriQuery, ExpandoPane, dojoNum, on, lang, topic, dojoEvent, registry) {

    var selectionGrid = Backbone.View.extend({

      initialize: function(options) {
        this.mapUtil = options.mapUtil;
        this.grid = null;
        this.gLayer = null;
        this.idField = null;

        topic.subscribe('smartmapUI/def-expr-set', lang.hitch(this, function(args) {
          this.receiveDefExprResults(args.indicatorCollection, args.admLevelNum, args.graphicsArr, args.fLayer);
        }));

        topic.subscribe('smartmapUI/layer-updated', lang.hitch(this, function(args) {
          this.layerUpdated(args.layer);
        }));

        this.render();
      },

      render: function() {
        this.gridExpandoPane = new ExpandoPane({
          id: 'gridExpando',
          'class': 'bottom-right-content-pane',
          region: 'bottom',
          splitter: true,
          duration: '125',
          startExpanded: false,
          content: viewTemplate
        });
        this.$el.html(this.gridExpandoPane);

        this.startup();

        return this;
      },

      startup: function() {

        this.gridContainer = registry.byId('mapBorderContainer');

        // Make entire titleWrapper clickable (only for vertical one)
        on(this.gridExpandoPane.titleWrapper, 'click', lang.hitch(this, function() {
          this.gridExpandoPane.toggle();
        }));

        // but ignore above event when the iconNode is clicked -- otherwise, the grid
        // toggles twice, resulting in no change in the grid's appearance.
        on(this.gridExpandoPane.iconNode, 'click', function(e) {
          dojoEvent.stop(e);
        });

      },

      layerUpdated: function(layer) {
        if (layer.graphics.length) {
          this.gridExpandoPane.set('title', 'Results');
          this.gridContainer.addChild(this.gridExpandoPane);
          this.grid.resize();
        } else {
          this.gridContainer.removeChild(this.gridExpandoPane);
        }
      },

      receiveDefExprResults: function(indicatorCollection, admLevelNum, graphicsArr, fLayer) {
        var self = this;

        this.gLayer = fLayer;
        this.idField = 'CODGOV';

        var regionNameField = 'NAME_' + admLevelNum;

        var columnsObj = {};
        var normByObj = {};

        columnsObj[regionNameField] = 'Region Name';

        indicatorCollection.each(function(indicatorModel) {
          var labelStr = indicatorModel.get('DESC_SHORT');
          columnsObj[indicatorModel.get('FIELD_NM')] = labelStr;
        });

        var resultsArr = _.map(graphicsArr, function(gr) {
          var tempObj = {};
          tempObj[self.idField] = gr.attributes[self.idField];

          _.each(columnsObj, function(gridLabel, fieldName) {
            tempObj[fieldName] = gr.attributes[fieldName];
          });

          _.each(normByObj, function(normField) {
            tempObj[normField] = gr.attributes[normField];
          });
          return tempObj;
        });

        if (!this.grid) {
          this.createGrid();
        }
        this.populateGridWithDefExprResults(columnsObj, resultsArr);
      },

      createGrid: function() {

        if (!$('#grid').length) {
          this.gridContainer.addChild(this.gridExpandoPane);
        }

        this.grid = new(declare([Grid, Selection]))({
          id: 'dgrid',
          bufferRows: Infinity,
          columns: {}
        }, 'grid');
        this.grid.on('dgrid-select', lang.hitch(this, this.rowClickHandler));

        window.dgrid = this.grid;

      },

      populateGridWithDefExprResults: function(columnsObj, dataArr) {
        this.grid.set('columns', columnsObj);
        this.grid.refresh(); // inexplicably, this *clears* the grid. stupid dgrid.
        this.grid.renderArray(dataArr);
      },

      rowClickHandler: function(evt) {
        var featureId = evt.rows[0].data[this.idField];
        this.selectFeatureById(featureId);
      },

      selectFeatureById: function(featureId) {
        var selectedGr = _.find(this.gLayer.graphics, function(gr) {
          return gr.attributes.CODGOV === featureId;
        });
        if (selectedGr) {
          this.broadcastGraphicForPopup(selectedGr);
        } else {
          console.error('Failed to find feature ' + featureId + ' in grid');
        }

      },

      broadcastGraphicForPopup: function(graphic) {
        this.mapUtil.setPopup(graphic);
      }

    });

    return selectionGrid;
  });
