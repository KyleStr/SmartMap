define(['../models/indicatorModel'],

  function(IndicatorModel) {
    var IndicatorsCollection = Backbone.Collection.extend({
      model: IndicatorModel,

      // Comparator defines the default sort attribute
      comparator: function(model) {
        return model.get('DESC_SHORT');
      },

      initialize: function() {}
    });
    return IndicatorsCollection;
  });
