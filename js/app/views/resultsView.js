/* global initScrollable */
define([
    'dojo/_base/lang',
    'dojo/topic',
    'app/util/mapUtil',
    'dojo/text!../templates/resultsViewTemplate.html'
  ],

  function(lang, topic, MapUtil, resultsViewTemplate) {
    var ResultsView = Backbone.View.extend({

      // The base template for this view.
      template: null,
      controls: {},
      indicatorCollection: null,
      mapUtil: null,

      initialize: function() {
        this.template = _.template(resultsViewTemplate);
        this.controls = {};

        this.sortField = null;
        this.reverse = false;
        topic.subscribe('smartmapUI/def-expr-set', lang.hitch(this, this.onSmartmapResultsChange));
        topic.subscribe('smartmapUI/layer-updated', lang.hitch(this, this.onSmartmapLayerUpdate));

      },

      render: function() {

        // Render proper results in resultView.
        this.resultsFeatures = _.sortBy(this.resultsFeatures, function(feat) {
          if (_.isString(feat.attributes[this.sortField])) {
            var strippedStr = feat.attributes[this.sortField].toLowerCase();
            strippedStr = this.makeSortStr(strippedStr);
            return strippedStr;
          } else {
            return feat.attributes[this.sortField];
          }
        }, this);
        // this feels a little hacky.
        if (this.reverse) {
          this.resultsFeatures = this.resultsFeatures.reverse();
        }

        this.$el.html(this.template());
        // Proper classes in sort options
        if (this.sortField) {
          var $sortBtn = this.$('[data-sort-field="' + this.sortField + '"]');

          $sortBtn.removeClass('sort-none');
          if (this.reverse) {
            $sortBtn.addClass('sort-desc');
          }
          else {
            $sortBtn.addClass('sort-asc');
          }
        }

        this.initControls();
        return this;
      },

      makeSortStr: function(str) {
        var translate_sp = /[áâãàéêíóôõúüçñ]/g;
        var translate = {
          'á': 'a', 'â': 'a', 'ã': 'a', 'à': 'a', 'é': 'e', 'ê': 'e', 'í': 'i',
          'ó': 'o', 'ô': 'o', 'õ': 'o', 'ú': 'u', 'ü': 'u', 'ç': 'c', 'ñ': 'n'
        };
        return ( str.replace(translate_sp, function(match) {
          return translate[match];
        }) );
      },

      initControls: function() {
        // Init the scrollbars.
        initScrollable();

        this.controls.toggle = this.$('.drawer-toggle');
        this.controls.sortFields = this.$('[data-sort-field]');
        this.controls.regionCells = this.$('.cell-region');

        this.addEventListeners();
      },

      addEventListeners: function() {
        this.controls.toggle.click(lang.hitch(this, this.toggle_ClickHandler));
        this.controls.sortFields.click(lang.hitch(this, this.sort_ClickHandler));
        this.controls.regionCells.click(lang.hitch(this, this.regionCell_ClickHandler));
      },

      /**
       * Event Handlers
       */
      toggle_ClickHandler: function(e) {
        e.preventDefault();
        this.$el.toggleClass('open');
      },

      sort_ClickHandler: function(e) {
        e.preventDefault();
        this.sortField = $(e.target).data('sort-field');
        this.reverse = !this.reverse;
        this.render();
      },

      regionCell_ClickHandler: function(evt) {
        var selectedCodgov = $(evt.target).closest('.cell-region').attr('data-codgov');
        var selectedGraphic = _.find(this.resultsFeatures, function(feat) {
          // coerce both variables to strings.
          return '' + feat.attributes.CODGOV === '' + selectedCodgov;
        });
        if (selectedGraphic) {
          this.mapUtil.setPopup(selectedGraphic);
        } else {
          console.warn('Could not find graphic with this codgov: ' + selectedCodgov);
        }
      },

      onSmartmapResultsChange: function(args) {
        this.adminLevel = args.admLevelNum;
        this.adminLabel = args.admLevLabel;
        this.indicatorCollection = args.indicatorCollection;
        this.resultsFeatures = args.graphicsArr;
        this.featureLayer = args.fLayer;
        this.render();
      },

      onSmartmapLayerUpdate: function(args) {
        if (!this.mapUtil) {
          this.mapUtil = new MapUtil({map: args.layer.getMap()});
        }
        if (!args.layer.graphics.length) {
          this.adminLevel = null;
          this.indicatorCollection = null;
          this.resultsFeatures = [];
          this.render();
          this.$el.removeClass('open');
        }
      }

    });
    return ResultsView;
  });
