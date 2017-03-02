define([],

  function() {
    var MapModel = Backbone.Model.extend({
      defaults: {
        'map': {},
        'user': ''
      }
    });
    return MapModel;
  });
