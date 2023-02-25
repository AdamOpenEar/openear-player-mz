self.addEventListener('install', function(event) {

  // Perform install steps
	const CACHE_NAME = 'openear-player-sw-v1.33';
	const BASE_URL = 'https://oe-jukebox/';
	console.log('[SERVICE WORKER] install');
	var urlsToCache = [
		BASE_URL,
		BASE_URL + 'sw.js',
		BASE_URL + 'index.html',
		BASE_URL + 'favicon.ico',
		BASE_URL + 'bower_components/angular/angular.min.js',
		BASE_URL + 'bower_components/angular-route/angular-route.min.js',
		BASE_URL + 'bower_components/moment/min/moment.min.js',
		BASE_URL + 'bower_components/angular-moment/angular-moment.min.js',
		BASE_URL + 'ng/init.js',
		BASE_URL + 'ng/app.js',
		BASE_URL + 'ng/controller/PlayerCtrl.js',
		BASE_URL + 'ng/controller/LogCtrl.js',
		BASE_URL + 'ng/controller/LoginCtrl.js',
		BASE_URL + 'ng/controller/OverlayCtrl.js',
		BASE_URL + 'ng/controller/MultiCtrl.js',
		BASE_URL + 'ng/factory/FileFactory.js',
		BASE_URL + 'ng/factory/HTTPFactory.js',
		BASE_URL + 'ng/factory/MediaFactory.js',
		BASE_URL + 'ng/factory/LangFactory.js',
		BASE_URL + 'ng/factory/SocketFactory.js',
		BASE_URL + 'ng/lib/FileSystem.js',
		BASE_URL + 'ng/service/LogSrvc.js',
		BASE_URL + 'ng/service/StatusSrvc.js',
		BASE_URL + 'ng/service/PlayerSrvc.js',
		BASE_URL + 'ng/service/OverlaySrvc.js',
		BASE_URL + 'ng/service/SettingsSrvc.js',
		BASE_URL + 'ng/service/QueueSrvc.js',
		BASE_URL + 'ng/service/ActionSrvc.js',
		BASE_URL + 'ng/directive/ScheduleDirective.js',
		BASE_URL + 'ng/template/login.html',
		BASE_URL + 'ng/template/overlay-help.html',
		BASE_URL + 'ng/template/overlay-lastPlayed.html',
		BASE_URL + 'ng/template/overlay-logout.html',
		BASE_URL + 'ng/template/overlay-playlists.html',
		BASE_URL + 'ng/template/overlay-queue.html',
		BASE_URL + 'ng/template/overlay-schedule.html',
		BASE_URL + 'ng/template/overlay-settings.html',
		BASE_URL + 'ng/template/player.html',
		BASE_URL + 'ng/template/playlists-ptp.html',
		BASE_URL + 'ng/template/playlists-time.html',
		BASE_URL + 'ng/template/schedule-box-inactive.html',
		BASE_URL + 'ng/template/schedule-box.html',
		BASE_URL + 'ng/template/schedule-calendar.html',
		BASE_URL + 'ng/template/schedule-template.html',
		BASE_URL + 'assets/css/normalize.css',
		BASE_URL + 'assets/css/main.css',
		BASE_URL + 'assets/css/responsive.css',
		BASE_URL + 'assets/css/fonts/foundation-icons.css',
		BASE_URL + 'assets/img/logo.png',
		BASE_URL + 'assets/img/logo-login.png',
		BASE_URL + 'assets/css/fonts/Montserrat-Light-webfont.eot',
		BASE_URL + 'assets/css/fonts/Montserrat-Light-webfont.woff2',
		BASE_URL + 'assets/css/fonts/Montserrat-Light-webfont.woff',
		BASE_URL + 'assets/css/fonts/Montserrat-Light-webfont.ttf',
		BASE_URL + 'assets/css/fonts/Montserrat-Light-webfont.svg',
		BASE_URL + 'assets/css/fonts/foundation-icons.eot',
		BASE_URL + 'assets/css/fonts/foundation-icons.woff',
		BASE_URL + 'assets/css/fonts/foundation-icons.ttf',
		BASE_URL + 'assets/css/fonts/foundation-icons.svg'
	]

	event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    console.log('[Service Worker] Caching all: app shell and content');
    await cache.addAll(urlsToCache);
  })());
});

self.addEventListener('fetch', event => {
  console.log('Fetch event for ', event.request.url);
  event.respondWith(
    caches.match(event.request)
    .then(response => {
      if (response) {
        console.log('Found ', event.request.url, ' in cache');
        return response;
      }
      console.log('Network request for ', event.request.url);
      return fetch(event.request)

      // TODO 4 - Add fetched files to the cache

    }).catch(error => {

      // TODO 6 - Respond with custom offline page

    })
  );
});