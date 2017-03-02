define([
    'dojo/text!../templates/locatorViewTemplate.html',
    'esri/dijit/Geocoder'
  ],

  function(viewTemplate, Geocoder) {
    var Locator = Backbone.View.extend({

      initialize: function(options) {
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
        this.geocoder = new Geocoder({
          map: this.map,
          autoComplete: true,
          arcgisGeocoder: true

        }, this.el);
        this.geocoder.startup();
      }
    });
    return Locator;
  });
