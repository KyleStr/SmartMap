define([
    'dojo/text!../templates/homeButtonViewTemplate.html',
    'dojo/_base/lang',
    'dojo/on',
    'esri/dijit/HomeButton'
  ],

  function(viewTemplate, lang, on, HomeButton) {
    var HomeButtonView = Backbone.View.extend({

      initialize: function(options) {
        this.extent = options.extent;
        this.map = options.map;
        this.render();
      },

      render: function() {
        var template = _.template(viewTemplate);
        this.$el.html(template);

        $(this.map.container).append(this.el);

        this.startup();
        return this;
      },

      startup: function() {
        this.homeButton = new HomeButton({
          map: this.map,
          extent: this.extent
        }, this.el);
      }
    });
    return HomeButtonView;
  });
