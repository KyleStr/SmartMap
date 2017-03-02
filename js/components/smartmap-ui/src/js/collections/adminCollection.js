define(['../models/adminModel'],

  function(AdminModel) {
    var AdminCollection = Backbone.Collection.extend({
      model: AdminModel,
      initialize: function() {}
    });
    return AdminCollection;
  });
