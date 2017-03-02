define([
    'dojo/_base/lang',
    'dojo/on',
    'dojo/text!../templates/countrySelectTemplate.html',
    'dojo/text!../templates/countryDisplayTemplate.html',
    './modalView',
    '../models/adminModel',
  ],

  function(lang, on, countrySelectTemplate, countryDisplayTemplate, ModalView, AdminModel) {
    var CountrySelectView = Backbone.View.extend({

      // collection --> From parent (countries collection).
      // model --> From parent
      // options.admins --> From parent (administrative area collection).

      controls: {},
      selectionModal: null,


      initialize: function(options) {
        ///this.collection.on('reset', this.renderModal, this)
        this.options = options;

        this.renderDisplay();
      },
      events: {
        'change #countrySelect': 'countrySelect_ChangeHandler',
        'change #adminLevelSelect': 'adminLevelSelect_ChangeHandler',
        'click #selectionFinished': 'modalConfirm_evHandler'
      },

      renderModal: function() {
        var template = _.template(countrySelectTemplate);

        var modalBody = template({
          countries: this.collection.toJSON()
        });

        //console.log(modalBody);

        var _self = this;

        // this.selectionModal = new ModalView({
        //   size: 'small',
        //
        //   header: '<h1 class="modal-title">Select location</h1>',
        //   body: modalBody,
        //   cancel: {
        //     classes: 'bttn-default',
        //     onCancel: function(e) {
        //
        //       // Custom onCancel to clear adminBase if user cancels from this modal.
        //       var adminLayer = app.map.getLayer('adminBase');
        //       adminLayer.setVisibility(false);
        //       e.preventDefault();
        //       this.destroy();
        //     }
        //   },
        //   confirm: {
        //     text: 'Next',
        //     title: 'Next',
        //     classes: 'bttn-primary disabled',
        //     onConfirm: lang.hitch(_self, _self.modalConfirm_evHandler),
        //   },
        //   closeOnClick: false,
        // });
        this.$el.find('#selectCountryView').html(modalBody);
        // Setup chosen.
        this.initControlsModal();
        // Display.
        //this.selectionModal.show();

      },

      initControlsModal: function() {
        this.controls.countrySelect = this.$el.find('#countrySelect');
        this.controls.adminLevelSelect = this.$el.find('#adminLevelSelect');

        this.controls.countrySelect.chosen({
          width: '100%',
          no_results_text: 'No Countries match',
          disable_search_threshold: 6
        });

        this.controls.adminLevelSelect.chosen({
          width: '100%',
          no_results_text: 'No Admin Levels match',
          disable_search_threshold: 6
        });
        this.addEventHandlersModal();
      },

      addEventHandlersModal: function() {
        // on(this.controls.countrySelect.chosen(), 'change', lang.hitch(this, this.countrySelect_ChangeHandler));
        // on(this.controls.adminLevelSelect.chosen(), 'change', lang.hitch(this, this.adminLevelSelect_ChangeHandler));
      },

      renderDisplay: function() {
        var countryName = null;
        var adminLevelName = null;

        try {
          countryName = this.model.get('country').get(SmartmapUI.analyticsController.COUNTRY_NAME);
          adminLevelName = this.model.get('adminLevel').get('label');
        } catch (err) {
          // Do nothing. Let them be empty.
        }

        var template = _.template(countryDisplayTemplate);

        this.$el.html(template({
          countryName: countryName,
          adminLevelName: adminLevelName
        }));

        // Add empty class to the parent. Can't be done through the template.
        if (countryName && adminLevelName) {
          this.$el.removeClass('empty');
        } else {
          this.$el.addClass('empty');
        }

        this.initControlsDisplay();
        var that = this;
        setTimeout(function() {
          that.renderModal();
        }, 0);
      },

      updateSelectCount: function(countObj) {
        var countStr = countObj.totalCount ? countObj.selectedCount + ' of ' + countObj.totalCount : '0';
        this.$el.find('.badge').html(countStr);
      },

      initControlsDisplay: function() {
        this.controls.start = this.$el.find('#smcountry-select');
        this.controls.editCountry = this.$el.find('#smcountry-edit');

        this.addEventHandlersDisplay();
      },

      addEventHandlersDisplay: function() {
        this.controls.start.click(lang.hitch(this, this.startBtn_evHandler));
        this.controls.editCountry.click(lang.hitch(this, this.editCountry_evHandler));
      },


      /**
       * Event Handlers
       */
      modalConfirm_evHandler: function(e) {
        this.renderDisplay();
        this.trigger('countrySelectionFinished');
      },

      countrySelect_ChangeHandler: function(event) {
        // When a country is selected block the next button.
        // By default it is disabled but if the user changes the country
        // after selecting the admin level it needs to be disabled again.

        var iso = event.target.value;
        this.model.set('country', this.collection.findWhere({
          CNTRY_ISO: iso
        }));

        this.updateAdminLevels();
      },

      adminLevelSelect_ChangeHandler: function(event) {
        var adminValue = event.target.value;
        this.model.set('adminLevel', this.options.admins.findWhere({
          value: adminValue
        }));

        // Enable the Next button.
        $('#selectionFinished').removeAttr('disabled');
      },

      startBtn_evHandler: function(e) {
        this.reset();
      },

      editCountry_evHandler: function(event) {
        event.preventDefault();
        var _self = this;

        var modal = new ModalView({
          size: 'small',

          header: '<h1 class="modal-title">Change country</h1>',
          body: '<p>Indicators differ between countries and levels of aggregation. Changing them will reset any indicator you selected.</p>',
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
              _self.trigger('countryEdit');
            }
          },
          //closeOnClick: false,
        });

        // Display.
        modal.show();
      },


      /**
       * Methods
       */
      // Update the admin levels on the dropdown based on the country selection.
      updateAdminLevels: function() {
        var analyticsController = SmartmapUI.analyticsController;
        var models = [];

        // clear old admin level from model, in case it matches the new one
        this.model.unset('adminLevel', {
          silent: true
        });

        // Get admin level names from Collection
        var country = this.model.get('country');

        var adm1 = new AdminModel({
          label: country.get(analyticsController.ADM_1_EN_NAME),
          field: analyticsController.ADM_1_AVAILABLE,
          value: '1'
        });
        models.push(adm1);

        // See if ADM2 is applicable, if so add a second model
        var adm2Name = country.get(analyticsController.ADM_2_EN_NAME);

        if (adm2Name && adm2Name !== analyticsController.NOT_APPLICABLE) {
          var adm2 = new AdminModel({
            label: adm2Name,
            field: analyticsController.ADM_2_AVAILABLE,
            value: '2'
          });
          models.push(adm2);
        }
        this.options.admins.reset(models);

        // Build list of Options and update Select
        var options = [];
        this.options.admins.each(function(admin) {
          options.push(new Option(admin.get('label'), admin.get('value')));
        });

        $('#adminLevelSelect').empty();
        $('#adminLevelSelect').append(new Option(), options);
        $('#adminLevelSelect').removeAttr('disabled');
        $('#adminLevelSelect').trigger('chosen:updated');
        // this.controls.adminLevelSelect.empty();
        // this.controls.adminLevelSelect.append(new Option(), options);
        // this.controls.adminLevelSelect.removeAttr('disabled');
        // this.controls.adminLevelSelect.trigger('chosen:updated');
        console.log(this.controls.adminLevelSelect);
      },

      reset: function() {
        // Clear the model to start over.
        this.model.unset('country', {
          silent: true
        });
        this.model.unset('adminLevel', {
          silent: true
        });
        //this.collection.fetch({reset: true});

        this.renderDisplay();
        this.renderModal();
      },

    });
    return CountrySelectView;
  });
