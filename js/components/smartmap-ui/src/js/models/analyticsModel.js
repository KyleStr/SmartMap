define(function() {
  var AnalyticsModel = Backbone.Model.extend({
    defaults: {
      country: null, // countryModel
      adminLevel: null, // string
      indicator: null // indicatorModel
    }
  });
  return AnalyticsModel;
});
