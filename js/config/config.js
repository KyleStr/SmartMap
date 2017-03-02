/* global define */
define(function() {
  return {

    geometryService: {
      url: 'http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer'
    },

    smartmapServiceUrl: 'http://smartmap.nexso.org/arcgis/rest/services/NEXSO_RDS/MapServer/', //remote ArgisServer
    basemap: 'gray',
    extent: {
      'xmin': -13511620.6159105,
      'ymin': -1429096.2726455973,
      'xmax': -4422340.708466036,
      'ymax': 4372779.922310879,
      'spatialReference': {
        'wkid': 102100
      }
    },

    header: 'NEXSO',
    tagline: 'SmartMap'
  };
});
