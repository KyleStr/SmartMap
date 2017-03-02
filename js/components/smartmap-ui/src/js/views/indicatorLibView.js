/* global initScrollable */
define([
  'dojo/promise/all',
  'dojo/_base/lang',
  'dojo/on',

  '../collections/categoriesCollection',
  '../collections/indicatorsCollection',

  './modalView',
  'dojo/text!../templates/indicatorLibModalTemplate.html',
  ],

  function(all, lang, on, CategoriesCollection, IndicatorsCollection, ModalView, indicatorLibModalTemplate) {
    var IndicatorLibView = Backbone.View.extend({

      // Constants for queries.
      CATEGORY: 1,
      VARIABLE: 4,

      // collection: -> list of all countries

      // List of categories from where we get
      // descriptions and names.
      allCategories: new CategoriesCollection(),

      controls: {},

      initialize: function(options) {
        this.controls = {};

        this.allCategories = new CategoriesCollection();

        // getAllCategories will return a list of categories from where we get
        // descriptions and names.
        Smartmap.getAllCategories().then(lang.hitch(this, function(results) {
          this.allCategories.reset(_.pluck(results.features, 'attributes'));
        }), function(error) {
          console.error(error);
        });




      },

      open: function(country, category, indicator) {

        var _self = this;
        this.country = country || null;
        this.category = category || null;
        indicator = indicator || null;
        // List with all the indicators to render.
        this.indicators = [];
        // Name of the selected category.
        this.categoryName = null;

        this.renderContent();

        this.initControls();
        // Display.
        // this.libraryModal.show();

        if (this.country) {
          this.processCountrySelection().then(lang.hitch(this, function(){

            if (this.category) {
              this.processCategorySelection();
              this.renderContent();
              this.initControls();

              if (indicator) {
                //Scrollables.
                initScrollable();
                var that = this;
                setTimeout(function(){
                  //scrollable-inner is the element that scrolls.
                  //The wrapper is added by the plugin.
                  var $scrollable = that.$el.find('.scrollable-inner');
                  //Position with 32px of extra space.
                  var position = $scrollable.scrollTop() + $('#' + indicator).position().top - 32;
                  $scrollable.animate({scrollTop: position});

                  $('#' + indicator).closest('article').css({'background-color':'#CDCCD1'});
                  $('#' + indicator).closest('article').animate({'padding':'2em'},  "slow");
                }, 200);

              }

            }

          }));
        }

      },

      renderModal: function() {
      },

      renderContent: function() {
        var template = _.template(indicatorLibModalTemplate);
        var indicatorGroupped = [];

        if (this.indicators.length) {
          // Group by category name.
          indicatorGroupped = _.groupBy(this.indicators, function(indicator){ return indicator.get('CATEGORY3_NAME'); });
        }


        this.$el.html(template({
          countries: this.collection.toJSON(),
          selectedCountry: this.country,
          selectedCat: this.category,
          selectedCatName: this.categoryName,
          indicatorGroupped: indicatorGroupped,
        }));

        // return template({
        //   countries: this.collection.toJSON(),
        //   selectedCountry: this.country,
        //   selectedCat: this.category,
        //   selectedCatName: this.categoryName,
        //   indicatorGroupped: indicatorGroupped,
        // });
      },

      initControls: function() {
        // Scrollables.
        // initScrollable();

        this.controls.countrySelect = this.$el.find('#countrySelect');
        this.controls.categorySelect = this.$el.find('#categorySelect2');

        this.controls.countrySelect.chosen({
          width: '100%',
          no_results_text: 'No Countries match',
          disable_search_threshold: 6
        });

        if (this.category) {
          this.controls.categorySelect.val(this.category);
          this.controls.categorySelect.trigger('chosen:updated');
        }


        this.controls.categorySelect.chosen({
          width: '100%',
          no_results_text: 'No Countries match',
          disable_search_threshold: 6
        });

        this.addEventHandlers();
      },

      addEventHandlers: function() {
        on(this.controls.countrySelect.chosen(), 'change', lang.hitch(this, this.countrySelect_ChangeHandler));
        on(this.controls.categorySelect.chosen(), 'change', lang.hitch(this, this.categorySelect_ChangeHandler));
        // this.controls.categorySelect.click(lang.hitch(this, this.categorySelect_ChangeHandler));
        if (this.category) {
          $('#categorySelect2_chosen').find('.chosen-single').find('span').removeClass();
          $('#categorySelect2_chosen').find('.chosen-single').find('span').addClass(this.category, 'icon');
        }
      },

      /**
       * Event Handlers
       */
      countrySelect_ChangeHandler: function(event) {
        this.country = event.target.value;
        // Reset category selection.
        this.category = null;
        this.categoryName = null;
        this.indicators = [];

        // this.libraryModal.updateBody(this.renderContent());
        if (this.country) {
          this.processCountrySelection().then(lang.hitch(this, function(){

            if (this.category) {
              this.processCategorySelection();
              // this.libraryModal.updateBody(this.renderContent());
              this.renderContent();
              this.initControls();

              // if (indicator) {
              //   scrollable-inner is the element that scrolls.
              //   The wrapper is added by the plugin.
              //   var $scrollable = this.$el.find('.scrollable-inner');
              //   Position with 32px of extra space.
              //   var position = $scrollable.scrollTop() + $('#' + indicator).position().top - 32;
              //   $scrollable.animate({scrollTop: position});
              // }

            }
            this.renderContent();
            this.initControls();

          }));
        }

        this.renderContent();
        this.initControls();

        this.processCountrySelection();

      },

      categorySelect_ChangeHandler: function(event) {
        // Set active button.
        // var clickedBttn = $(event.target);

        // If it has already been clicked, ignore.
        // if (clickedBttn.hasClass('active')) {
        //   return;
        // }

        // this.controls.categorySelect.removeClass('active');
        // clickedBttn.addClass('active');

        $('#categorySelect2_chosen').find('.chosen-single').find('span').removeClass();

        $('#categorySelect2_chosen').find('.chosen-single').find('span').addClass(event.target.value, 'icon');

        this.category = event.target.value;

        this.processCategorySelection();
        // this.libraryModal.updateBody(this.renderContent());
        this.renderContent();
        this.initControls();
      },

      // Fetches all the categories for the selected country.
      // Fetches all indicators for the selected country (will be filtered by
      // category later on).
      processCountrySelection: function() {
        var promise = new $.Deferred();
        // Use admin level one since all the categories are the same.
        var categories = Smartmap.getCategories(this.country, 1, {
          categoryLevel: this.CATEGORY
        });

        // Use admin level one since all the categories are the same.
        // All the indicators for this country.
        // WIll be filtered for the given category.
        var allIndicators = Smartmap.getIndicators(this.country, 1);

        all([categories, allIndicators]).then(lang.hitch(this, function(results) {
          var categoriesProc = Smartmap.processCategories(this.CATEGORY, results[0].features, this.allCategories);

          // Disable all buttons and enable only the ones that exist.
          // this.controls.categorySelect.attr('disabled', 'disabled');
          // _.each(categoriesProc, lang.hitch(this, function(cat) {
          //   this.controls.categorySelect.filter('[data-category="' + cat.CATEGORY_ID + '"]').removeAttr('disabled');
          // }));

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

      // Populates the indicators array with the indicators
      // for the country/category pair.
      processCategorySelection: function() {

        this.indicators = [];

        this.countryIndicators.each(lang.hitch(this, function(indicator) {
          if (indicator.get('CATEGORY1') === this.category) {
            var subtypeCategoryName = this.allCategories.findWhere({
              CATEGORY_ID: indicator.get('CATEGORY3')
            }).get('CATEGORY_NAME');
            indicator.set('CATEGORY3_NAME', subtypeCategoryName);
            this.indicators.push(indicator);
          }
        }));
      },

      reset: function() {

      }

    });
    return IndicatorLibView;
  }
);
