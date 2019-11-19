/* @if NODE_ENV == 'DEVELOPMENT' */
angular.module('OEPlayer',[
    'ngRoute',
    'angular-svg-round-progress',
    'angularMoment'
])
/* @endif */
/* @if NODE_ENV == 'PRODUCTION' */
angular.module('OEPlayer',[
    'ngRoute',
    'angular-svg-round-progress',
    'angularMoment',
    'templates'
])
/* @endif */
.config(['$httpProvider','$routeProvider',function($httpProvider,$routeProvider) {

    /* @if NODE_ENV == 'DEVELOPMENT' */
    $routeProvider.when('/login', {
        templateUrl: 'ng/template/login.html',
        controller: 'LoginCtrl'
    }).when('/player',{
        templateUrl:'ng/template/player.html'
    }).otherwise('/login');
    /* @endif */
    /* @if NODE_ENV == 'PRODUCTION' */
    $routeProvider.when('/login', {
        templateUrl: 'login.html',
        controller: 'LoginCtrl'
    }).when('/player',{
        templateUrl:'player.html'
    }).otherwise('/login');
    /* @endif */
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
    'api_url':'http://localhost/oe-apis/oe-player/v2/public/',
    'module_dir':'ng',
    'local_path':'/',
    'file_extention':'.mp3',
    'log_path':'http://localhost/oe-apis/oe-player/v2/public/log-track',
    'version':'/* @echo version */',
    'template':'ng/template/',
    'socket':'wss://openear-ws-v3.herokuapp.com'
})
/* @endif */
/* @if NODE_ENV == 'PRODUCTION' */
.constant('config',{
    'api_url':'https://api.player.openearmusic.com/v2/',
    'module_dir':'ng',
    'local_path':'/',
    'file_extention':'.mp3',
    'log_path':'https://api.player.openearmusic.com/v2/log-track',
    'version':'/* @echo version */',
    'template':'',
    'socket':'wss://openear-ws-v3.herokuapp.com'
})
/* @endif */
.controller('AppCtrl',['config','$scope',function(config,$scope){
    $scope.version = config.version;
}]);
