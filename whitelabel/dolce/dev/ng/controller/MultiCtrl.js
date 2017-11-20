angular.module('OEPlayer')
.controller('MultiCtrl',['$scope','SettingsSrvc',function($scope,SettingsSrvc){

	$scope.title = SettingsSrvc.zoneName;
	
}]);
