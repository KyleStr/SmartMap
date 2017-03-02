/* global wNumb, initDropdown */
define([
    'dojo/_base/lang',
    'dojo/on',
    'dojo/text!../templates/indicatorSelectTemplate.html',
    './indicatorView'
  ],
  function(lang, on, indicatorSelectTemplate, IndicatorView) {
    var IndicatorSelectView = Backbone.View.extend({

      // Constants for queries.
      CATEGORY: 1,
      SUBTYPE: 3,
      VARIABLE: 4, // or Indicator

      // Holds all indicators available.
      // collection: -(Collection)

      // List of categories from where we get
      // descriptions and names.
      // allCategories: (Collection)

      // country and admin level.
      region: {},

      // Controls for this indicator.
      controls: {},

      // Categories available for the selected country
      // and admin level.
      categories: [],

      // Holds the selected indicator.
      // Corresponds to the lowest level in the selection process
      // (Category > subtype > indicator).
      // This is used once the modal is closed to render the indicator,
      // and to notify the parent.
      model: null,

      // Data for the indicator. set with renderDisplay()
      filterData: {},

      // The category to which this indicator belongs
      indicatorCat: null,

      // Amount of selected indicators.
      selectedIndicatorsCount: null,

      initialize: function(options) {
        this.allCategories = options.allCategories;
        this.region = options.region;
        this.controls = {};
        this.categories = [];
        this.selectedIndicatorsCount = options.selectedIndicatorsCount;

        this.model = null;
        this.filterData = {};

        this.indicatorCat = null;


        var categories = Smartmap.getCategories(this.region.country, this.region.admin, {
          categoryLevel: this.CATEGORY
        });

        categories.then(lang.hitch(this, function(results) {
          // console.log('IndicatorView F:initialize');
          this.categories = Smartmap.processCategories(this.CATEGORY, results.features, this.allCategories);
          // this.renderModal();
          this.renderDisplay();
        }), function(error) {
          console.error(error);
        });
      },
      events: {
        'click #selectionIndicatorFinished': 'modalConfirm_handler'
      },

      renderDisplay: function() {
        var template = _.template(indicatorSelectTemplate);


        this.$el.html(template({
          categories: this.categories,
        }));

        // html del selector de indicadores
        // console.log(modalBody);

        var remainingIndicators = SmartmapUI.analyticsController.MAX_INDICATORS - this.selectedIndicatorsCount;
        var _self = this;


        // this.$el.find('#selectIndicatorView').html(modalBody);
        this.initControlsModal();
        // Setup chosen.




      },

      initControlsModal: function() {
        this.controls.categorySelect = this.$el.find('#categorySelect');
        this.controls.subtypeSelect = this.$el.find('#subtypeSelect');
        this.controls.indicatorSelect = this.$el.find('#indicatorSelect');

        this.controls.categorySelect.chosen({
          width: '100%',
          no_results_text: 'No Categories match',
          disable_search_threshold: 6
        });

        this.controls.subtypeSelect.chosen({
          width: '100%',
          no_results_text: 'No Subtypes match',
          disable_search_threshold: 6
        });

        this.controls.indicatorSelect.chosen({
          width: '100%',
          no_results_text: 'No Indicators match',
          disable_search_threshold: 6
        });

        this.addEventHandlersModal();
      },

      addEventHandlersModal: function() {
        on(this.controls.categorySelect.chosen(), 'change', lang.hitch(this, this.categorySelect_ChangeHandler));
        on(this.controls.subtypeSelect.chosen(), 'change', lang.hitch(this, this.subtypeSelect_ChangeHandler));
        on(this.controls.indicatorSelect.chosen(), 'change', lang.hitch(this, this.indicatorSelect_ChangeHandler));
      },







      /**
       * Event Handlers
       */

      modalConfirm_handler: function(e) {
        // model is the selectedIndicator.
        var view = new IndicatorView({
          collection: this.collection,
          allCategories: this.allCategories,
          selectedIndicatorsCount: this.selectedIndicatorsCount,
          region: this.region
        });

        this.trigger('indicatorSelectionFinished', this.model, this, this.indicatorCat, view);

      },

      categorySelect_ChangeHandler: function(e) {
        // console.log('IndicatorView F:categorySelect_ChangeHandler');
        // e.preventDefault();
        // Set active button.
        // var clickedBttn = $(e.target);

        // If it has already been clicked, ignore.
        // if (clickedBttn.hasClass('active')) {
        //   return;
        // }

        // Disable done button.
        // this.selectionModal.bttnConfirmDisable();
        $('#selectionIndicatorFinished').attr('disabled', true);

        $('#categorySelect_chosen').find('.chosen-single').find('span').removeClass();

        $('#categorySelect_chosen').find('.chosen-single').find('span').addClass(e.target.value, 'icon');

        this.controls.categorySelect.removeClass('active');
        // clickedBttn.addClass('active');

        // Disable other selects.
        this.updateChosen(this.controls.subtypeSelect);
        this.updateChosen(this.controls.indicatorSelect);

        this.indicatorCat = e.target.value;
        this.updateSubtypeSelect(this.indicatorCat);

        this.indicatorGroupShow();
      },

      indicatorGroupShow(){
        $('.indicatorSelectGroup').fadeIn();
      },

      subtypeSelect_ChangeHandler: function(e) {
        // console.log('IndicatorView F:subtypeSelect_ChangeHandler');
        // Disable done button.
        // this.selectionModal.bttnConfirmDisable();
        $('#selectionIndicatorFinished').attr('disabled', true);

        // Set active button.
        var subtype = e.target.value;

        // Disable other selects.
        this.updateChosen(this.controls.indicatorSelect);

        this.updateIndicatorSelect(subtype);
      },

      indicatorSelect_ChangeHandler: function(e) {
        // console.log('IndicatorView F:indicatorSelect_ChangeHandler');
        // Store the selected indicator
        var selectedIndicatorName = e.target.value;
        this.model = this.collection.findWhere({
          FIELD_NM: selectedIndicatorName
        });

        // Enable the Done button.
        // this.selectionModal.bttnConfirmEnable();
        $('#selectionIndicatorFinished').removeAttr('disabled');
      },




      /**
       * Utilities
       */
      updateSubtypeSelect: function(category) {
        // Query to get the categories for the next level.
        var subtype = Smartmap.getCategories(this.region.country, this.region.admin, {
          categoryLevel: this.SUBTYPE,
          limit: {
            category: this.CATEGORY,
            value: category
          }
        });

        subtype.then(lang.hitch(this, function(results) {
          var subtypeOptions = Smartmap.processCategories(this.SUBTYPE, results.features, this.allCategories);
          subtypeOptions = subtypeOptions.map(function(obj) {
            return new Option(obj.CATEGORY_NAME, obj.CATEGORY_ID);
          });

          this.updateChosen(this.controls.subtypeSelect, subtypeOptions);

        }), function(error) {
          console.error(error);
        });
      },

      updateIndicatorSelect: function(subtype) {

        var subcatIndicatorOptions = [];
        this.collection.each(function(model) {
          if (model.get('CATEGORY3') === subtype) {
            subcatIndicatorOptions.push(new Option(model.get('DESC_SHORT'), model.get('FIELD_NM')));
          }
        });

        this.updateChosen(this.controls.indicatorSelect, subcatIndicatorOptions);

      },

      // Updates the chosen select.
      // If options is null or not provided the select
      // will be emptied and disabled.
      updateChosen: function(control, options) {
        options = options || null;

        $(control).empty();
        if (options) {
          $(control).append(new Option(), options);
          $(control).removeAttr('disabled');
        } else {
          $(control).attr('disabled', 'disabled');
        }
        $(control).trigger('chosen:updated');
      },

      cleanup: function() {
        // Remove this view
        this.remove();
      }

    });
    return IndicatorSelectView;
  });
