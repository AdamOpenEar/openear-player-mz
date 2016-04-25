angular.module('OEPlayer')
.controller('LogCtrl',['$scope','LogSrvc','$rootScope',function($scope,LogSrvc,$rootScope){

	$scope.logs = LogSrvc.logs;
	
}]);
