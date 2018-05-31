angular.module('OEPlayer')
.service('QueueSrvc',['$rootScope',function($rootScope){

	var QueueSrvc = {
		queuePosition:1,
		currIndex:0
	};

	QueueSrvc.nextTrack = function(index){
		QueueSrvc.currIndex = index;
		$rootScope.$emit('queue:nexttrack');
	}

	QueueSrvc.setQueue = function(tracks){
		QueueSrvc.tracks = tracks;
		$rootScope.$emit('queue:set');
	};

	QueueSrvc.updateQueue = function(track){
		QueueSrvc.queuePosition++;
		QueueSrvc.track = track;
		$rootScope.$emit('queue:update');
	}

	return QueueSrvc;
}]);