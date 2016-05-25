angular.module('OEPlayer')
.controller('LoginCtrl',['$scope','HTTPFactory','$location','$http','$rootScope','StatusSrvc',function($scope,HTTPFactory,$location,$http,$rootScope,StatusSrvc){

    $scope.formData = {
        username:'',
        password:''
    };

    var query = $location.search();

    if(Object.keys(query).length !== 0 && JSON.stringify(query) !== JSON.stringify({})){

        HTTPFactory.loginHash({loginHash:query.hash}).success(function(data){
            if(data.authToken){
                $http.defaults.headers.common.Authentication = data.authToken;
                localStorage.setItem('Authentication',data.authToken);
                localStorage.setItem('lastLogin',new Date());
                localStorage.setItem('venue',data.venue[0].name);
                $location.path( '/player' );
            } else {
                $scope.message = data.error;
            }
        }).error(function(){
            if(!localStorage.getItem('lastLogin')){
                StatusSrvc.setStatus('ERR-PLY02. Player offline and no record of last login. Please check connection.');
            } else {
                if(!$scope.checkLastLogin){
                    StatusSrvc.setStatus('Last login over 30 days ago. Please connect to the internet and login.' );
                } else {
                    $location.path('/player');
                }
            }
        });

    } else if(localStorage.getItem('Authentication')){
        $http.defaults.headers.common.Authentication = localStorage.getItem('Authentication');
        $location.path( '/player' );
    } 

    $scope.processLogin = function(){

        if(!$rootScope.online){
            if(!localStorage.getItem('lastLogin')){
                StatusSrvc.setStatus('ERR-PLY02. Player offline and no record of last login. Please check connection.');
            } else {
                if(!$scope.checkLastLogin){
                    StatusSrvc.setStatus('Last login over 30 days ago. Please connect to the internet and login.' );
                } else {
                    $location.path('/player');
                }
            }
        } else {

            HTTPFactory.login($scope.formData).success(function(data){
                if(data.authToken){
                    $http.defaults.headers.common.Authentication = data.authToken;
                    localStorage.setItem('Authentication',data.authToken);
                    localStorage.setItem('lastLogin',new Date());
                    localStorage.setItem('venue',data.venue[0].name);
                    $location.path( '/player' );
                } else {
                    $scope.message = data.error;
                }
            });
        }

    };

    $scope.checkLastLogin = function(){
        var lastLogin = new Date(localStorage.getItem('lastLogin'));
        var today = new Date();
        var timeDiff = Math.abs(today.getTime() - lastLogin.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return diffDays > 30 ? false : true;
    };

}]);
