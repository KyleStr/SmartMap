define([
    'dojo/text!../templates/mainViewTemplate.html',
    './resultsView'
  ],

  function(mainViewTemplate, ResultsView) {
    var MainView = Backbone.View.extend({

      // The base template for this view.
      template: null,
      subviews: {},

      initialize: function() {
        this.template = _.template(mainViewTemplate);
        this.subviews = {};

        // Init subviews.
        this.subviews.resultsView = new ResultsView();
      },

      render: function() {
        this.$el.html(this.template());
        this.subviews.resultsView.setElement(this.$('#resultsView')).render();

        return this;
      }

    });
    return MainView;
  });
