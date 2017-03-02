define([
    'dojo/_base/lang',
    'app/util/mapUtil',
    'dojo/topic',
  ],

  function(lang, MapUtil, topic) {
    return Backbone.View.extend({

      // The base template for this view.
      controls: {},
      map: null,

      constructor: function(params) {
        this.map = params.map;
        this.mapUtil = new MapUtil({map: this.map});
        this.initControls();
      },

      initControls: function() {
        this.controls.back = $('#report-print-back');
        this.controls.print = $('#report-print-print');
        this.addEventListeners();
        topic.subscribe('view-report', lang.hitch(this, this.viewReport_ClickHandler));
      },

      addEventListeners: function() {
        this.controls.back.click(lang.hitch(this, this.viewReport_ClickHandler));
        this.controls.print.click(lang.hitch(this, this.printReport_ClickHandler));
      },

      /**
       * Event Handlers
       */
      viewReport_ClickHandler: function(e) {
        this.mapUtil.hidePopups();
        var mapCenter = this.map.extent.getCenter();
        $('html').toggleClass('printView');
        this.map.resize(true);
        this.map.centerAt(mapCenter);
      },

      printReport_ClickHandler: function(evt) {
        window.print();
      }
    });
  });
