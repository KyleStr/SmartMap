define([
    'dojo/text!../templates/modalViewTemplate.html',
    'dojo/_base/lang',
    'dojo/on'
  ],

  function(viewTemplate, lang, on) {
    var ModalView = Backbone.View.extend({

      sizeMatrix: {
        'small': 'modal-s',
        'medium': 'modal-m',
        'large': 'modal-l',
      },

      controls: {},

      // Modal options.
      options : {},

      sizeClass: 'modal-l',
      container: null,

      header: null,
      body: null,
      actions : {
        cancel: {
          text: 'Cancel',
          title: 'Cancel',
          classes: 'bttn-default',
          onCancel: function(e) {
            e.preventDefault();
            this.destroy();
          }
        },
        confirm: {
          text: 'Confirm',
          title: 'Confirm',
          classes: 'bttn-default',
          onConfirm: function(e) {}
        }
      },
      closeOnClick: true,

      /**
       * Options:
       * size: The size of the modal.
       * container: The element to which the modal will be appended.
       *   When not provided the body is used.
       *
       * header: Content for the header.
       * body: Content for the body.
       * cancel:
       *   text: Text for the cancel button.
       *   title: Title for the cancel button.
       *   classes: Class to define the button type like: bttn-default
       *   onCancel: Callback.
       * confirm:
       *   text: Text for the confirm button.
       *   title: Title for the confirm button.
       *   classes: Class to define the button type like: bttn-default
       *   onCancel: Callback.
       *
       * closeOnClick: Whether to close the modal when there's a click outside.
       */
      initialize: function(options) {

        this.options = options || {};

        this.header = options.header || this.header;
        this.body = options.body || this.body;

        if (this.options.cancel === false) {
          this.showCancel = false;
        }
        else {
          this.showCancel = true;
          _.extend(this.actions.cancel, this.options.cancel);
        }

        if (this.options.confirm === false) {
          this.showConfirm = false;
        }
        else {
          this.showConfirm = true;
          _.extend(this.actions.confirm, this.options.confirm);
        }

        this.closeOnClick = options.closeOnClick  !== false;

        this.sizeClass = this.sizeMatrix[this.options.size] || this.sizeClass;
        this.container = this.options.container || $('body');

        this.render();
      },

      render: function() {
        var showCancel = this.showCancel,
            showConfirm = this.showConfirm,
            template = _.template(viewTemplate);

        // Compute the modal
        var modal = $(template({
          showCancel: showCancel,
          showConfirm: showConfirm,
        }));

        if (this.header) {
          modal.find('.modal-header').html(this.header);
        }
        if (this.body) {
          modal.find('.modal-body').html(this.body);
        }

        // Configure controls.
        if (showConfirm) {
        this.controls.confirm = modal.find('button[data-modal-confirm]');
        this.controls.confirm
          .addClass(this.actions.confirm.classes)
          .text(this.actions.confirm.text)
          .attr('title', this.actions.confirm.title);
        }

        if (showCancel) {
        this.controls.cancel = modal.find('button[data-modal-dismiss]');
        this.controls.cancel
          .addClass(this.actions.cancel.classes)
          .text(this.actions.cancel.text)
          .attr('title', this.actions.cancel.title);
        }

        // Add size class.
        modal.addClass(this.sizeClass);
        // Set as view element.
        this.setElement(modal);
        // Append to container.
        this.container.append(this.$el);
        // Add event listeners.
        this.addEventHandlers();

        this.modal = modal;

        return this;
      },

      show: function() {
        // Add revealed class. This ensures that the animation runs since
        // it's added to the end of the call stack.
        var _self = this;
        setTimeout(function() { _self.$el.addClass('revealed'); }, 0);
        return this;
      },

      destroy: function() {
        this.$el.remove();
        return this;
      },

      bttnConfirmDisable: function() {
        this.controls.confirm.addClass('disabled');
      },

      bttnConfirmEnable: function() {
        this.controls.confirm.removeClass('disabled');
      },

      bttnCancelDisable: function() {
        this.controls.cancel.addClass('disabled');
      },

      bttnCancelEnable: function() {
        this.controls.cancel.removeClass('disabled');
      },

      updateBody: function(content) {
        this.modal.find('.modal-body').html(content);
      },

      /**
       * Event Handlers
       */
      addEventHandlers: function() {
        if (this.closeOnClick) {
          this.$el.click(lang.hitch(this, function(e) {
            // Prevent children from triggering this.
            if(e.target === e.currentTarget) {
              this.actions.cancel.onCancel.call(this, e);
            }
          }));
        }

        // Both for close button and cancel button.
        this.$el.find('[data-modal-dismiss]').click(lang.hitch(this, function(e) {
            e.preventDefault();
            this.actions.cancel.onCancel.call(this, e);
        }));

        this.$el.find('[data-modal-confirm]').click(lang.hitch(this, this.actions.confirm.onConfirm));
      },

    });
    return ModalView;
  }
);
