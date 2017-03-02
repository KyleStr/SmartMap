//     Smartmap.js 0.1.0
//     Esri/IDB-MIF 2014

(function() {

  // Setup
  // ------

  // Save the value of any existing `Smartmap` variable.
  var previousSmartmap = window.Smartmap;

  var Smartmap = function() {};

  // Place the `Smartmap` variable in the global namespace
  window.Smartmap = Smartmap;

  // Assign default properties.
  Smartmap.oldSmartmap = previousSmartmap;
  Smartmap.LOOKUP = 'LOOKUP';
  Smartmap.METADATA = 'METADATA';
  Smartmap.CATEGORIES = 'CATEGORY_DESCRIPTION';

  // Assign version number.
  Smartmap.version = '0.1.0';

  // Create a caching object.
  Smartmap.cache = {};

  // Create a configuration object.
  Smartmap.config = {
    serviceUrl: '',
    helper: ''
  };

  // Public Methods
  // --------------

  // ### Smartmap.configure
  //
  // Accepts a hash of configuration options to be assigned to the configuration object.
  Smartmap.configure = Smartmap.prototype.configure = function(options) {
    _.each(options, function(value, key) {
      this.config[key] = value;
    }, this);
    // Get the schema as soon as configure is called
    this.getSchema().then(this.getAllCategories());
  };

  // ### Smartmap.getSchema
  //
  // Gets the schema definition for the Smartmap Service.
  // The schema definition conforms to the ArcGIS for Server Map Service definition format.
  // Depending on the helper library being used, get back either a Promise or Dojo Deferred
  Smartmap.getSchema = Smartmap.prototype.getSchema = function() {

    // First check the cache, if its there, just resolve a promise with it.
    if (this._isCached('schema')) {
      return this._makePromise().resolve(this.cache.schema);
    }

    var request,
      url,
      config = this.config,
      query = '?f=json';

    // Append query to the url because jQuery gets confused if we use a `data` attribute on a proxied url with an existing '?'
    url = config.serviceUrl + query;

    request = this._request(url, 'json');

    // Cache schema internally
    request.then(function(response) {
      if (response.error) {
        console.error(response.error);
        return null;
      }

      var lookup = {};

      // Build a lookup
      _.each(response.tables.concat(response.layers), function(obj) {
        lookup[obj.name] = obj;
      });

      Smartmap._cache('schema', response);
      Smartmap._cache('lookup', lookup);
    });

    return request;
  };

  // ### Smartmap.getLookup
  Smartmap.getLookup = Smartmap.prototype.getLookup = function() {
    var lookup = this._makePromise();

    // First check the cache, if its there, just resolve a promise with it.
    if (this._isCached('lookup')) {
      lookup.resolve(this.cache.lookup);
      return lookup;
    }

    // If not already cached, retrieve the schema
    var self = this,
      promise = this.getSchema().then(function(response) {
        if (self._isCached('lookup')) {
          lookup.resolve(self.cache.lookup);
        }
      });

    return lookup;
  };

  // ### Smartmap.getAllCountries
  //
  // Gets all countries supported by Smartmap
  Smartmap.getAllCountries = Smartmap.prototype.getAllCountries = function() {
    var self = this,
      countries = this._makePromise();

    // First check the cache, if its there, just resolve a promise with it.
    if (this._isCached('countries')) {
      return countries.resolve(this.cache.countries);
    }

    // If `schema` is already cached, make the request, otherwise call `getSchema()`
    if (this._isCached('schema')) {
      this._fetchAllCountries(countries);
    } else {
      this.getSchema().then(function(response) {
        if (self._isCached('schema')) {
          self._fetchAllCountries(countries);
        }
      });
    }

    return countries;
  };

  // ### Smartmap.getAllCategories
  //
  // Get all indicator categories supported by Smartmap.
  Smartmap.getAllCategories = Smartmap.prototype.getAllCategories = function() {
    var self = this,
      categories = this._makePromise();

    // First check the cache, if its there, just resolve a promise with it.
    if (this._isCached('categories')) {
      return categories.resolve(this.cache.categories);
    }

    // If `schema` is already cached, make the request, otherwise call `getSchema()`
    if (this._isCached('schema')) {
      this._fetchAllCategories(categories);
    } else {
      this.getSchema().then(function(response) {
        if (self._isCached('schema')) {
          self._fetchAllCategories(categories);
        }
      });
    }

    return categories;
  };

  // ### Smartmap.getCategories
  //
  // Get categories for a given set of regions
  Smartmap.getCategories = Smartmap.prototype.getCategories = function(country, level, options) {
    var self = this,
      categories = this._makePromise(),
      params = {
        country: country,
        level: level,
        options: options
      };

    if (this._isCached('schema')) {
      this._fetchCategories(categories, params);
    } else {
      this.getSchema().then(function(response) {
        if (self._isCached('schema')) {
          self._fetchCategories(categories, params);
        }
      });
    }

    return categories;
  };

  // ### Smartmap.getIndicators
  //
  // Get available indicators for a given country and admin level.
  // Arguments are a country ISO code and an admin level.
  Smartmap.getIndicators = Smartmap.prototype.getIndicators = function(country, level) {
    var self = this,
      indicators = this._makePromise(),
      params = {
        country: country,
        level: level
      };

    // TODO: Figure out if there is an intelligent way to cache this value,
    // we can't just cache it blindly or it will just always return the first
    // dataset it found, even when country and level are changed.
    //
    // THOUGHT: Maybe we cache an object that represents not only the indicators,
    // but also the associated country/level so we can check to see if they match
    // the current request? Do we keep all previous requests cached, or just the
    // most recent? Or maybe the last X number of requests that were made?
    //
    // First check the cache, if its there, just resolve a promise with it.
    // if (this._isCached('indicators')) {
    //   return this._makePromise().resolve(this.cache.indicators);
    // }

    // If `schema` is already cached, make the request, otherwise call `getSchema()`
    if (this._isCached('schema')) {
      this._fetchIndicators(indicators, params);
    } else {
      this.getSchema().then(function(response) {
        if (self._isCached('schema')) {
          self._fetchIndicators(indicators, params);
        }
      });
    }

    return indicators;
  };

  // ### Smartmap.getFeatures
  Smartmap.getFeatures = Smartmap.prototype.getFeatures = function(country, level) {
    var self = this,
      features = this._makePromise(),
      params = {
        country: country,
        level: level
      };

    // If `schema` is already cached, make the request, otherwise call `getSchema()`
    if (this._isCached('lookup')) {
      this._fetchFeatures(features, params);
    } else {
      this.getSchema().then(function(response) {
        if (self._isCached('lookup')) {
          self._fetchFeatures(features, params);
        }
      });
    }

    return features;
  };

  // ### Smartmap.getCountryFeatures
  Smartmap.getCountryFeatures = Smartmap.prototype.getCountryFeatures = function(countries) {
    var self = this,
      countryFeatures = this._makePromise(),
      params = {
        countries: countries
      };

    // If `schema` is already cached, make the request, otherwise call `getSchema()`
    if (this._isCached('lookup')) {
      this._fetchCountryFeatures(countryFeatures, params);
    } else {
      this.getSchema().then(function(response) {
        if (self._isCached('lookup')) {
          self._fetchCountryFeatures(countryFeatures, params);
        }
      });
    }

    return countryFeatures;
  };

  // Internal Methods
  // ----------------

  // Cache a key/value pair to be used in the future.
  Smartmap._cache = function(name, value) {
    this.cache[name] = value;
  };

  Smartmap._isCached = function(name) {
    return _.has(this.cache, name) && !_.isNull(this.cache.name);
  };

  // Form and send a request to the Smartmap service.
  // Arguments are the URL and expected response type
  Smartmap._request = function(url, expect) {
    var request;
    if (this.config.helper === 'jquery') {
      request = $.ajax({
        url: url,
        dataType: expect
      });
    } else {
      require(['dojo/request/xhr'], function(xhr) {
        request = xhr(url, {
          handleAs: expect,
          headers: {
            'X-Requested-With': '' // Workaround to stop Dojo from sending preflight OPTIONS (which fails)
          }
        });
      });
    }
    return request;
  };

  Smartmap._makePromise = function() {
    var promise;
    if (this.config.helper === 'jquery') {
      promise = new $.Deferred();
    } else {
      require(['dojo/Deferred'], function(Deferred) {
        promise = new Deferred();
      });
    }
    return promise;
  };

  // Fetch Methods
  // -------------

  // These methods make the actual XHR requests to the Smartmap Service.
  // Each method accepts a promise to be fulfilled when the request is returned.

  Smartmap._fetchAllCountries = function(promise) {
    var request,
      url,
      query;

    query = '/query?' + [
      'where=1=1',
      'outFields=*',
      'f=json'
    ].join('&');

    url = this.config.serviceUrl + '/' + _.findWhere(this.cache.schema.tables, {
      name: this.LOOKUP
    }).id + query;

    request = this._request(url, 'json');

    request.then(function(response) {
      Smartmap._cache('countries', response);
      promise.resolve(response);
    });
  };

  Smartmap._fetchAllCategories = function(promise) {
    var request,
      url,
      query;

    query = '/query?' + [
      'where=1=1',
      'outFields=*',
      'f=json'
    ].join('&');

    url = this.config.serviceUrl + '/' + _.findWhere(this.cache.schema.tables, {
      name: this.CATEGORIES
    }).id + query;

    request = this._request(url, 'json');

    request.then(function(response) {
      Smartmap._cache('categories', response);
      promise.resolve(response);
    });
  };

  Smartmap._fetchCategories = function(promise, options) {
    var country = options.country,
      level = options.level,
      params = options.options,
      request,
      url,
      where,
      outFields,
      query;

    where = 'where=' + encodeURIComponent('(CNTRY_ISO=\'' + country + '\') AND (AVAIL_ADM' + level + ' = 1)');

    if (params.limit) {
      where = where + encodeURIComponent(' AND CATEGORY' + params.limit.category + ' = \'' + params.limit.value + '\'');
    }

    outFields = 'outFields=' + encodeURIComponent(['CATEGORY' + params.categoryLevel]);

    query = '/query?' + [
      where,
      outFields,
      'returnDistinctValues=true',
      'f=json'
    ].join('&');

    url = this.config.serviceUrl + '/' + _.findWhere(this.cache.schema.tables, {
      name: this.METADATA
    }).id + query;

    request = this._request(url, 'json');

    request.then(function(response) {
      promise.resolve(response);
    });
  };

  Smartmap._fetchIndicators = function(promise, options) {

    var country = options.country,
      level = options.level,
      request,
      url,
      where,
      outFields,
      query;

    where = 'where=' + encodeURIComponent('(AVAIL_ADM' + level + ' = 1) AND (CNTRY_ISO = \'' + country + '\') AND (FIELD_NM NOT IN (\'ID_0\', \'codGov\'))');

    outFields = 'outFields=' + encodeURIComponent(['FIELD_NM', 'DESC_SHORT', 'DESC_LONG', 'DERIVED', 'INTL_DATA',
      'COMMENTS', 'SRC1', 'UNITS', 'CATEGORY1', 'CATEGORY2', 'CATEGORY3', 'CATEGORY4', 'LOGO_URL', 'PROVIDER_URL'
    ].join(','));

    query = '/query?' + [
      where,
      outFields,
      'f=json'
    ].join('&');

    url = this.config.serviceUrl + '/' + _.findWhere(this.cache.schema.tables, {
      name: this.METADATA
    }).id + query;

    request = this._request(url, 'json');

    request.then(function(response) {
      // Smartmap._cache('indicators', response);
      promise.resolve(response);
    });
  };

  Smartmap._fetchFeatures = function(promise, options) {
    var country = options.country,
      level = options.level,
      request,
      layerId,
      url,
      query;

    // Construct layer name from country and level
    layerId = [country, level].join('_');

    // Query for all features and fields
    query = '/query?' + [
      'f=json',
      'where=' + encodeURIComponent('1=1'),
      'returnGeometry=true',
      'spatialRel=esriSpatialRelIntersects',
      'outFields=*'
    ].join('&');

    url = this.config.serviceUrl + this.cache.lookup[layerId].id + query;

    request = this._request(url, 'json');

    request.then(function(response) {
      // Smartmap._cache('indicators', response);
      promise.resolve(response);
    });

  };

  Smartmap._fetchCountryFeatures = function(promise, options) {
    var countries = options.countries,
      request,
      url,
      query,
      layerId = 'ADM0';

    // Query for all features and fields
    query = '/query?' + [
      'f=json',
      'where=' + encodeURIComponent('ISO IN (\'' + countries.join('\', \'') + '\')'),
      'returnGeometry=true',
      'spatialRel=esriSpatialRelIntersects',
      'outFields=*',
      'maxAllowableOffset=1000'
    ].join('&');

    url = this.config.serviceUrl + this.cache.lookup[layerId].id + query;

    request = this._request(url, 'json');

    request.then(function(response) {
      // Smartmap._cache('countries', response);
      promise.resolve(response);
    });
  };
  
  // ### Smartmap.processCategories
  //
  // Gets the category data from allCategories for the categories in features
  // according to a given level.
  Smartmap.processCategories = Smartmap.prototype.processCategories = function(level, features, allCategories) {
    var categories = [];
    // Construct level id.
    var levelId = 'CATEGORY' + level;

    _.each(features, function(feature) {
      var catId = feature.attributes[levelId];

      if (catId === null) { return; }
      
      var cat = allCategories.findWhere({
        CATEGORY_ID: catId
      });
      
      categories.push({
        CATEGORY_ID: cat.get('CATEGORY_ID'),
        CATEGORY_NAME: cat.get('CATEGORY_NAME')
      });
    });
    return categories;
  };

}.call(this));
