define([
    'dojo/_base/lang',
    'dojo/text!../templates/layoutViewTemplate.html',
    'app/views/mainView',
    '../../components/smartmap-ui/release/js/views/modalView',
    'dojo/text!../templates/aboutModalTemplate.html',
  ],

  function(lang, layoutTemplate, MainView, ModalView, aboutModalTemplate) {
    var LayoutView = Backbone.View.extend({

      // The base template for this view.
      template: null,
      container: null,
      subviews: {},

      initialize: function() {
        this.template = _.template(layoutTemplate);
        this.subviews = {};
        this.container = null;
        this.controls = {};

        // Init subviews.
        this.subviews.mainView = new MainView();
      },

      render: function() {
        this.$el.html(this.template());
        // This is needed in controller js to plugin other views.
        this.container = this.$el.find('#site-body');

        //Render subviews.
        this.subviews.mainView.setElement(this.$('#site-body')).render();

        this.initControls();
        this.addEventListeners();

        this.mapControlsOverride();
        return this;
      },

      initControls: function() {
        this.controls.map = this.$el.find('#show-map');
        this.controls.about = this.$el.find('#show-about');
        this.controls.indicators = this.$el.find('#show-indicator-lib');
        this.arrow = this.$el.find('#arrow-down');
        var mapLeft = this.controls.map.offset().left;
        this.arrow.css('left', (mapLeft -10)+'px');
      },

      addEventListeners: function() {
        this.controls.map.click(lang.hitch(this, function(e) {
          e.preventDefault();
          if (this.actualView === 'map') {
            return;
          }
          this.actualView = 'map';
          this.moveArrow(this.controls.map.offset(), this.controls.map.width());
          this.panelShow();
          this.hideAllViews();
          $('#panelToogle').fadeIn();
        }));
        this.controls.about.click(lang.hitch(this, function(e) {
          e.preventDefault();
          if (this.actualView === 'about') {
            return;
          }
          this.actualView = 'about';
          this.moveArrow(this.controls.about.offset(), this.controls.about.width());
          this.panelHide();
          this.hideAllViews();
          this.renderAbout();
          $('#panelToogle').fadeOut();
        }));
        this.controls.indicators.click(lang.hitch(this, function(e) {
          e.preventDefault();
          if (this.actualView === 'indicators') {
            return;
          }
          this.actualView = 'indicators';
          this.moveArrow(this.controls.indicators.offset(), this.controls.indicators.width());
          this.panelHide();
          this.hideAllViews();
          this.renderIndicators();
          $('#panelToogle').fadeOut();
        }));

        $('body').on('click', '.indicator-info',  lang.hitch(this, function(e) {
          e.preventDefault();
          this.actualView = 'indicators';
          this.moveArrow(this.controls.indicators.offset(), this.controls.indicators.width());
          this.panelHide();
          this.hideAllViews();
          this.$el.find('#indicators').html(window.indicatorLibView.$el);
          $('#panelToogle').fadeOut();
        }));

        $('body').on('click', '#backToMap',  lang.hitch(this, function(e) {
          e.preventDefault();
          this.actualView = 'map';
          this.moveArrow(this.controls.map.offset(), this.controls.map.width());
          this.panelShow();
          this.hideAllViews();
          $('#panelToogle').fadeIn();
        }));

        $('body').on('click', '#site-title',  lang.hitch(this, function(e) {
          e.preventDefault();
          if (this.actualView === 'map') {
            return;
          }
          this.actualView = 'map';
          this.moveArrow(this.controls.map.offset(), this.controls.map.width());
          this.panelShow();
          this.hideAllViews();
          $('#panelToogle').fadeIn();
        }));


      },

      renderAbout: function() {

        var modalBody = _.template(aboutModalTemplate)();
        var _self = this;

        this.$el.find('#about').html(modalBody);

        return this;
      },

      renderIndicators: function() {
        window.indicatorLibView.open();
        this.$el.find('#indicators').html(window.indicatorLibView.$el);
      },

      displayIndicators: function(){
        // this.controls.indicators = this.$el.find('#show-indicator-lib');
        this.actualView = 'indicators';
        this.moveArrow(this.controls.indicators.offset(), this.controls.indicators.width());
        this.panelHide();
        this.hideAllViews();
        this.$el.find('#indicators').html(window.indicatorLibView.$el);
      },

      panelHide(){
        var right = $('#smartmap-ui').css( 'right');
        console.log(right);
        if (right === '0px') {
          $('#panelToogle').css({transform: 'rotate(-90deg)'});
          $('#panelToogle').css({'line-height': '24px'});
          $('#smartmap-ui').animate({right:'-375px'},375);
          $('#resultsView').animate({width: '100vw'},375);
        }
      },

      panelShow(){
        var right = $('#smartmap-ui').css( 'right');
        console.log(right);
        if ((right !== '0px')&&($('#panelToogle').attr('state') === "opened")) {
          $('#panelToogle').css({transform: 'rotate(90deg)'});
          $('#panelToogle').css({'line-height': '53px'});
          $('#smartmap-ui').animate({right:'0px'},375);
          var width = $( window ).width() - 375;
          $('#resultsView').animate({width: width+'px'},375);
        }
      },

      moveArrow(offset, width){
        var arrowOffset = this.arrow.offset();
        var move = offset.left ;
        if (arrowOffset.left > offset.left) {
          $('#arrow-down').animate({left: move+'px'},100);
        }
        else {
          $('#arrow-down').animate({left: move+'px'},100);
        }
      },

      hideAllViews(){
        this.$el.find('#about').html('');
        this.$el.find('#indicators').html('');
      },

      // Override default map controls with more stylish ones.
      // This should be replaces with a more scalable approach.
      mapControlsOverride: function() {
        this.$el.find('#map-zin').click(lang.hitch(this, function(e) {
          e.preventDefault();
          $('#mapContainer_zoom_slider .esriSimpleSliderIncrementButton').click();
        }));

        this.$el.find('#map-zout').click(lang.hitch(this, function(e) {
          e.preventDefault();
          $('#mapContainer_zoom_slider .esriSimpleSliderDecrementButton').click();
        }));

        this.$el.find('#map-home').click(lang.hitch(this, function(e) {
          e.preventDefault();
          $('#esri_dijit_HomeButton_0 .home').click();
        }));

        this.$el.find('#map-search').click(lang.hitch(this, function(e) {
          e.preventDefault();
          $(e.target).addClass('hide-me');
          $('#esri_dijit_Geocoder_0').addClass('open');
          setTimeout(function() { $('#esri_dijit_Geocoder_0_input').focus(); }, 100);
        }));

        $(document).click(lang.hitch(this, function(e) {
          var $target = $(e.target);

          // Do nothing when clicking the search button.
          if ($target.is('#map-search')) {
            return;
          }
          // If the click was not in the geocoder hide it.
          else if (!$target.parents('#esri_dijit_Geocoder_0').length) {
            $('#esri_dijit_Geocoder_0').removeClass('open');
            this.$el.find('#map-search').removeClass('hide-me');
          }
        }));
      }

    });

    return LayoutView;
  });
