// Check if a new cache is available on page load.
/*window.addEventListener('load', function(e) {

  window.applicationCache.addEventListener('updateready', function(e) {
    if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
      // Browser downloaded a new app cache.
      window.location.reload();
    } else {
      // Manifest didn't changed. Nothing new to server.
    }
  }, false);

}, false);*/
document.addEventListener('DOMContentLoaded', function onDeviceReady() {
	var el = document.querySelector('html');
    angular.bootstrap(el, ['OEPlayer']);
}, false);