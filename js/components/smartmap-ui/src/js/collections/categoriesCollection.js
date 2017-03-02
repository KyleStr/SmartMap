define(['../models/categoryModel'],

  function(CategoryModel) {
    var CategoriesCollection = Backbone.Collection.extend({
      model: CategoryModel,

      initialize: function() {}
    });
    return CategoriesCollection;
  });
