/* global define */
define([], function() {

	return {

		// Url to geometry server
		geometryService: {
			url: 'http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer'
		},

		/**
		 * Proxy configuration
		 * url: URL to the proxy page
		 * alwaysUseProxy: Whether or not to always use the proxy for XHR requests
		 * rules: Array of URL's for which the proxy should always be used when sending requests
		 */
		proxy: {
			url: '',
			alwaysUseProxy: false,
			rules: [ /* Add URLs here*/ ]
		},

		// Current version of the application
		appVersion: '0.1.0',

		/**
		 * Map Configuration
		 */

		/**
		 * Configuration of the map
		 * basemap: Basemap to display by default, options: topo, gray, satellite, streets
		 */
		map: {
			basemap: 'topo',
			center: [-77, 45],
			zoom: 3
		}
	};
});