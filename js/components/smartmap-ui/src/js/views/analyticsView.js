define([
    'dojo/_base/lang',
    'dojo/on',
    'dojo/topic',

    'esri/InfoTemplate',
    'esri/layers/GraphicsLayer',
    'esri/renderers/SimpleRenderer',

    'dojo/text!../templates/analyticsViewTemplate.html',
    '../collections/countriesCollection',
    '../collections/adminCollection',
    '../models/countryModel',
    './countrySelectView',
    './indicatorGroupView',

    './modalView',
    './indicatorLibView',
  ],

  function(lang, on, topic, InfoTemplate, GraphicsLayer, SimpleRenderer, viewTemplate, CountriesCollection, AdminCollection, CountryModel, CountrySelectView, IndicatorGroupView, ModalView, IndicatorLibView) {
    var AnalyticsView = Backbone.View.extend({

      //  model --> AnalyticsModel,
      // el --> Since this is the main view it's element is passed
      // by the parent.,

      controls: {},
      showBtns: null,

      initialize: function(options) {
        this.showBtns = options.showBtns;
        this.map = options.map;
        // Instantiate collections
        this.countries = new CountriesCollection();
        this.admins = new AdminCollection();
        this.analyticsLayer = this.createAnalyticsLayer();
        this.subviews = {};
        this.render();
      },
      events: {
        'click #panelToogle': 'panelToogle'
      },

      // Render the AnalyticsView a.k.a. "floating box"
      render: function() {
        var template = _.template(viewTemplate);
        var res = template({
          showBtns: this.showBtns
        });
        this.$el.html(res);

        this.startup();
      },

      startup: function() {
        // When the views are initialized the country collection is empty.
        this.subviews.indicatorLibView = new IndicatorLibView({
          collection: this.countries,
        });

        // To allow a general access to the indicatorLibView
        // keep a global reference to it.
        window.indicatorLibView = this.subviews.indicatorLibView;

        // Create countrySelectView for country selection.
        this.subviews.countrySelectView = new CountrySelectView({
          el: this.$el.find('#country-select'),
          collection: this.countries,
          model: this.model,
          admins: this.admins
        });

        this.initControls();
      },

      initControls: function() {
        // Initialize box controls like reset buttons and add indicator.
        this.controls.reset = this.$el.find('#smreset');
        this.controls.addIndicator = this.$el.find('#smindicator-add');
        this.controls.cancelIndicator = this.$el.find('#smindicator-cancel');
        this.controls.download = this.$el.find('#smdownload');
        this.controls.share = this.$el.find('#smshare');
        this.controls.report = this.$el.find('#smreport');

        //-        this.controls.selectedRegionsText = this.$el.find('.selected-regions')[0];
        //-        this.controls.totalRegionsText = this.$el.find('.total-regions-value')[0];
        //-        this.controls.rollupStatsBox = this.$el.find('.rollup-stats')[0];

        // Add box to map container
        //-        $(this.controls.rollupStatsBox).appendTo(this.map.container, 'last');

        this.addEventHandlers();
      },

      addEventHandlers: function() {
        this.controls.reset.click(lang.hitch(this, this.resetAll_evHandler));
        this.controls.report.click(lang.hitch(this, this.viewReport_evHandler));
        this.controls.download.click(lang.hitch(this, this.download_evHandler));
        this.controls.addIndicator.click(lang.hitch(this, this.addIndicator_evHandler));
        this.controls.cancelIndicator.click(lang.hitch(this, this.cancelndicator_evHandler));

        this.subviews.countrySelectView.on('countrySelectionFinished', this.countrySelectionFinished_evHandler, this);
        // The countryView has a button to edit the country.
        // However editing the country is the same as a reset
        // just with a different modal.
        this.subviews.countrySelectView.on('countryEdit', this.resetAll, this);
      },

      // Setup the country collection.
      // This function is called form analytics.js once the map is ready.
      // This function is in the analyticsView instead of countrySelectView
      // because the collection is used by IndicatorLibView as well.
      constructCountryCollection: function(countries) {
        _.each(countries, lang.hitch(this, function(feature) {
          this.countries.add(new CountryModel(feature.attributes));
        }));
      },

      createAnalyticsLayer: function() {
        var graphicsLayer = new GraphicsLayer({
          id: 'analyticsGraphicsLayer',
          title: 'Analytics Layer',
          visible: false
        });
        graphicsLayer.setInfoTemplate(new InfoTemplate());
        graphicsLayer.setRenderer(new SimpleRenderer(SmartmapUI.config.analyticsRenderer));
        this.formatInfowindow();
        this.map.addLayer(graphicsLayer);
        return graphicsLayer;
      },

      formatInfowindow: function() {
        // get rid of the (1 of 3) and paging ability on the popup
        this.map.infoWindow.pagingControls = false;
        this.map.infoWindow.pagingInfo = false;
      },


      /**
       * Event Handlers
       */

      panelToogle(){
        var right = $('#smartmap-ui').css( 'right');
        console.log(right);
        if (right === '0px') {
          $('#panelToogle').attr('state', 'closed');
          $('#panelToogle').css({transform: 'rotate(-90deg)'});
          $('#panelToogle').css({'line-height': '24px'});
          $('#smartmap-ui').animate({right:'-375px'},375);
          $('#resultsView').animate({width:'100vw'},375);
        }
        else {
          $('#panelToogle').attr('state', 'opened');
          $('#panelToogle').css({transform: 'rotate(90deg)'});
          $('#panelToogle').css({'line-height': '53px'});
          $('#smartmap-ui').animate({right:'0px'},375);
          var width = $( window ).width() - 375;
          $('#resultsView').animate({width: width+'px'},375);
        }
      },

      viewReport_evHandler: function() {
        topic.publish('view-report');
      },

      countrySelectionFinished_evHandler: function() {
        this.subviews.indicatorGroupView = new IndicatorGroupView({
          model: this.model,
          map: this.map,
          analyticsLayer: this.analyticsLayer
        });

        // Enable resetButton.
        this.controls.reset.removeClass('disabled');

        // Put view in it's proper place.
        this.$el.find('#indicator-select').html(this.subviews.indicatorGroupView.$el);
        this.subviews.indicatorGroupView.on('indicatorAdded', this.addedIndicator_evHandler, this);
        this.subviews.indicatorGroupView.on('indicatorRemoved', this.removedIndicator_evHandler, this);
        this.subviews.indicatorGroupView.on('selectCountChanged', this.selectCountChange_evHandler, this);

        // Show loading indicator.
        $('[data-loading-indicator]').addClass('revealed');

        // Wait for the indicatorGroupView to have loaded the categories
        // and indicators lists.
        this.subviews.indicatorGroupView.on('indicatorLoadComplete', function() {
          // Enable the add indicator button.
          this.controls.addIndicator.removeClass('disabled');
          // Add indicator after selecting country.
          this.subviews.indicatorGroupView.addIndicator();
        }, this);

        // hide the loading indicator on region return (this should happen slower than indicator return)
        this.subviews.indicatorGroupView.on('regionLoadComplete', function() {
          // Hide loading indicator.
          $('[data-loading-indicator]').removeClass('revealed');
        }, this);

      },

      removedIndicator_evHandler: function() {
        // console.log('AnalyticsView F:removeIndicator_evHandler');
        if (this.subviews.indicatorGroupView.selectedIndicators.length < SmartmapUI.analyticsController.MAX_INDICATORS) {
          this.controls.addIndicator.removeClass('disabled');
        }
        if (this.subviews.indicatorGroupView.selectedIndicators.length === 0) {
          // Disable the download and share btns if the indicators were all removed.
          this.controls.download.addClass('disabled');
          this.controls.share.addClass('disabled');
          this.controls.report.addClass('disabled');
        }
        this.trigger('indicatorRemoved');
      },

      addedIndicator_evHandler: function() {
        // console.log('AnalyticsView F:addedIndicator_evHandler');
        if (this.subviews.indicatorGroupView.selectedIndicators.length >= SmartmapUI.analyticsController.MAX_INDICATORS) {
          this.controls.addIndicator.addClass('disabled');
        }
        // Once there's one indicator enable the download and share btns.
        this.controls.download.removeClass('disabled');
        this.controls.share.removeClass('disabled');
        this.controls.report.removeClass('disabled');

        this.controls.cancelIndicator.css({display:'none'});
        this.controls.addIndicator.css({display:'block'});

        this.trigger('indicatorAdded');
      },

      addIndicator_evHandler: function(event) {
        event.preventDefault();
        if (this.subviews.indicatorGroupView) {
          this.controls.addIndicator.css({display:'none'});
          this.controls.cancelIndicator.css({display:'block'});
          this.subviews.indicatorGroupView.addIndicatorFlag(true);
          this.subviews.indicatorGroupView.render();
          this.subviews.indicatorGroupView.addIndicator();
        }
      },

      cancelndicator_evHandler: function(event) {
        event.preventDefault();
        if (this.subviews.indicatorGroupView) {
          this.controls.cancelIndicator.css({display:'none'});
          this.controls.addIndicator.css({display:'block'});
          this.subviews.indicatorGroupView.addIndicatorFlag(false);
          this.subviews.indicatorGroupView.render();
          // this.subviews.indicatorGroupView.addIndicator();
        }
      },

      selectCountChange_evHandler: function(countObj) {
        this.subviews.countrySelectView.updateSelectCount(countObj);
      },

      resetAll_evHandler: function(event) {
        var _self = this;

        var modal = new ModalView({
          size: 'small',

          header: '<h1 class="modal-title">Start over</h1>',
          body: '<p>Please note that your current selection will be lost.</p>',
          cancel: {
            classes: 'bttn-default',
          },
          confirm: {
            text: 'Confirm',
            title: 'Confirm',
            classes: 'bttn-primary',
            onConfirm: function() {
              // this -> modal
              this.destroy();
              _self.resetAll.call(_self);
            }
          },
          //closeOnClick: false,
        });

        // Display.
        modal.show();
      },

      download_evHandler: function(evt) {
        var filteredFeatures = this.subviews.indicatorGroupView.filteredGraphics;
        var selectedIndicators = this.subviews.indicatorGroupView.selectedIndicators;
        var adminLevel = this.model.get('adminLevel').get('value');
        this.generateCSV(filteredFeatures, selectedIndicators, adminLevel);
      },

      generateCSV: function(graphicsArr, indicators, adminLevel) {
        var titleRow = ['Region'];
        indicators.each(function(indicator) {
          titleRow.push('"' + indicator.get('DESC_SHORT') + '"'); // changed
        });

        var csvBody = [];
        _.each(graphicsArr, function(feat) {
          var row = [];
          row.push('"' + feat.attributes['NAME_' + adminLevel] + '"'); // changed
          indicators.each(function(indicator) {
            row.push('"' + feat.attributes[indicator.get('FIELD_NM')] + '"'); // changed
          });
          csvBody.push(row.join(','));
        });
        var csvStr = titleRow.join(',') + '\r\n' + csvBody.join('\r\n');
        this.downloadCSV(csvStr);
      },

      downloadCSV: function(csvStr) {

        if (window.navigator.msSaveOrOpenBlob) {
          this.msBlobSave(csvStr, 'filteredRegions.csv');
        } else {
          var fakeLink = document.createElement('a');
          fakeLink.href = 'data:attachment/csv,' + encodeURIComponent(csvStr);
          fakeLink.target = '_blank';
          fakeLink.download = 'filteredRegions.csv';

          document.body.appendChild(fakeLink);
          fakeLink.click();
          document.body.removeChild(fakeLink);
        }

      },

      msBlobSave: function(fileText, fileTitle) {
        var blobObject = new Blob([fileText]);
        window.navigator.msSaveOrOpenBlob(blobObject, fileTitle);
      },

      generateXLS: function(graphicsArr, indicators, adminLevel) {
        // thanks to https://github.com/jmaister/excellentexport
        var starterStr = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:Name>Hello</x:Name><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Results Download</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>';

        var titleRow = ['<thead><tr><th>Region'];
        indicators.each(function(indicator) {
          titleRow.push(indicator.get('DESC_SHORT'));
        });

        var xlsBody = [];
        _.each(graphicsArr, function(feat) {
          var row = [];
          row.push('<td>' + feat.attributes['NAME_' + adminLevel]);
          indicators.each(function(indicator) {
            row.push(feat.attributes[indicator.get('FIELD_NM')]);
          });
          xlsBody.push(row.join('</td><td>') + '</td>');
        });
        var xlsStr = starterStr + titleRow.join('</th><th>') + '</th></tr></thead><tbody><tr>' + xlsBody.join('</tr><tr>') + '</tr></tbody></table></body></html>';
        this.downloadXLS(xlsStr);

      },

      downloadXLS: function(xlsStr) {

        if (window.navigator.msSaveOrOpenBlob) {
          this.msBlobSave(xlsStr, 'filteredRegions.xls');
        } else {
          var fakeLink = document.createElement('a');
          fakeLink.href = 'data:application/vnd.ms-excel;base64,' + window.btoa(window.unescape(encodeURIComponent(xlsStr)));
          fakeLink.target = '_blank';
          fakeLink.download = 'filteredRegions.xls';

          document.body.appendChild(fakeLink);
          fakeLink.click();
          document.body.removeChild(fakeLink);
        }

      },


      /**
       * Methods
       */
      resetAll: function() {

        // Hide administrative boundaries layer
        var adminLayer = this.map.getLayer('adminBase');
        adminLayer.setVisibility(false);

        this.subviews.countrySelectView.reset();

        // Disable add indicator, reset, download, and share Buttons.
        this.controls.addIndicator.addClass('disabled');
        this.controls.reset.addClass('disabled');
        this.controls.download.addClass('disabled');
        this.controls.share.addClass('disabled');
        this.controls.report.addClass('disabled');

        this.subviews.indicatorGroupView.cleanup();
        this.subviews.indicatorGroupView = null;
      },

    });
    return AnalyticsView;
  });
