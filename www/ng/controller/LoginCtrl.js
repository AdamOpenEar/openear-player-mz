angular.module('OEPlayer')
.controller('LoginCtrl',['$scope','HTTPFactory','$location','$http',function($scope,HTTPFactory,$location,$http){

   $scope.formData = {
        username:'',
        password:''
    };

    $scope.processLogin = function(){

        HTTPFactory.login($scope.formData).success(function(data){

            if(data.authToken){
            	$http.defaults.headers.common.Authentication = data.authToken;
            	localStorage.setItem('Authentication',data.authToken);
        		$location.path( '/player' );
            } else {
                $scope.message = data.error;
            }
        });

    };
}]);