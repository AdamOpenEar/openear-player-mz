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
}])
/* @if NODE_ENV == 'DEVELOPMENT' */
.constant('config',{
    'api_url':'http://localhost/oe-apis/oe-player/v1/public/',
    'module_dir':'ng',
    'local_path':'/',
    'file_extention':'.mp3',
    'log_path':'https://api.player.openearmusic.com/v1/log-track',
    'version':'/* @echo version */'
})
/* @endif */
/* @if NODE_ENV == 'PRODUCTION' */
.constant('config',{
    'api_url':'https://api.player.openearmusic.com/v1/',
    'module_dir':'ng',
    'local_path':'/',
    'file_extention':'.mp3',
    'log_path':'https://api.player.openearmusic.com/v1/log-track',
    'version':'/* @echo version */'
})
/* @endif */
.controller('AppCtrl',['config','$scope',function(config,$scope){
    $scope.version = config.version;
}]);