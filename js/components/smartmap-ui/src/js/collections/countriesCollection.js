define(['../models/countryModel'],

  function(CountryModel) {
    var CountryCollection = Backbone.Collection.extend({
      model: CountryModel,
      initialize: function() {}
    });
    return CountryCollection;
  });
