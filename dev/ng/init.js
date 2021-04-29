document.addEventListener('DOMContentLoaded', function onDeviceReady() {
	var el = document.querySelector('html');
	if ('serviceWorker' in navigator) {
	  window.addEventListener('load', function() {
	    navigator.serviceWorker.register('sw.js').then(function(registration) {
	      // Registration was successful
	      console.log('ServiceWorker registration successful with scope: ', registration.scope);
	    }, function(err) {
	      // registration failed :(
	      console.log('ServiceWorker registration failed: ', err);
	    });
	  });
	}
  angular.bootstrap(el, ['OEPlayer']);
}, false);
