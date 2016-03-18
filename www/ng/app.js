angular.module('OEPlayer',[
    'ngRoute',
    'angular-svg-round-progress',
    'angularMoment',
    'templates'
])
.config(['$httpProvider','$routeProvider',function($httpProvider,$routeProvider) {

    $routeProvider.when('/login', {
        templateUrl: 'login.html',
        controller: 'LoginCtrl'
    }).when('/player',{
        templateUrl:'player.html'
    }).otherwise('/login');

    $httpProvider.interceptors.push("HttpErrorInterceptorModule");

}])
.run(['$rootScope','$location','$http','$window',function($rootScope,$location,$http,$window){

    $rootScope.$on('$routeChangeStart', function(event, next, current) {
        if(localStorage.getItem('Authentication')){
            $http.defaults.headers.common.Authentication = localStorage.getItem('Authentication');
        } else {
            $location.path( '/login' );
        }
    });
    //check if online
    $rootScope.online = navigator.onLine;
    $window.addEventListener("offline", function () {
        $rootScope.$apply(function() {
            $rootScope.online = false;
        });
      }, false);
    $window.addEventListener("online", function () {
        $rootScope.$apply(function() {
            $rootScope.online = true;
        });
      }, false);
  	//this runs the fast click javascript library to stop the 300ms touch screen delay
  	//FastClick.attach(document.body);
}])
.constant('config',{
    'api_url':'http://www.openearmusic.com/api/ios/',
    'module_dir':'ng',
    'music_library_url':'http://www.openearmusic.com/system/uploads/',
    'local_path':'/',
    'file_extention':'.mp3',
    'log_path':'http://www.openearmusic.com/api/ios/log-track',
    'version':'3.1.1 0.0.5'
});