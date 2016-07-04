angular.module('OEPlayer')
.service('PlayerSrvc',['$rootScope',function($rootScope){

	var PlayerSrvc = {};

	PlayerSrvc.updateTime = function(time){
		PlayerSrvc.timer = time;
		$rootScope.$broadcast('timeupdate');
	};

	PlayerSrvc.pushToPlay = function(playlist){
		PlayerSrvc.playlist = playlist;
		$rootScope.$broadcast('push-to-play');
	};

	PlayerSrvc.ptpSchedule = function(schedule){
		PlayerSrvc.schedule = schedule;
		$rootScope.$broadcast('ptp-schedule');
	};

	return PlayerSrvc;
}]);
