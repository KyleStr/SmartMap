/* global require */
var pathRegex = new RegExp(/\/[^\/]+$/);
var locationPath = location.pathname.replace(pathRegex, '');

require({
  packages: [
    { name: 'app', location: locationPath + 'js/app'},
    { name: 'components',  location:  locationPath + 'js/components'},
    { name: 'config',  location:  locationPath + 'js/config'},
    { name: 'lib', location: locationPath + 'lib'}
  ]
},
  ['app/controller'],
  function(Controller) {
    Controller.startup();
  }
);
