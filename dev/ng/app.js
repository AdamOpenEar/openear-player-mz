angular.module('OEPlayer',[
    'ngRoute',
    'angular-svg-round-progress',
    'angularMoment'
])
.config(['$httpProvider','$routeProvider',function($httpProvider,$routeProvider) {

    $routeProvider.when('/login', {
        templateUrl: 'ng/template/login.html',
        controller: 'LoginCtrl'
    }).when('/player',{
        templateUrl:'ng/template/player.html'
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
.constant('config',{
    'api_url':'http://localhost/oe-apis/oe-player/v2/public/',
    'module_dir':'ng',
    'local_path':'/',
    'file_extention':'.mp3',
    'log_path':'http://localhost/oe-apis/oe-player/v2/public/log-track',
    'version':'4.2.0 MULTI',
    'template':'ng/template/',
    'socket':'wss://ws.player.openearmusic.com'
})
.controller('AppCtrl',['config','$scope',function(config,$scope){
    $scope.version = config.version;
}]);
