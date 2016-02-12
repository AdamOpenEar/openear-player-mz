angular.module('OEPlayer')
.factory('MediaFactory',['$document','$rootScope','PlayerSrvc','$interval','$q','FileFactory','config','LogSrvc',function($document,$rootScope,PlayerSrvc,$interval,$q,FileFactory,config,LogSrvc){

	var self = this;

	var MediaFactory = function(playerName){
		self.playerName = playerName;
	};

	MediaFactory.prototype = {
		init:function(src){
			var deferred = $q.defer();
			FileFactory.readTrack(config.local_path,src)
				.then(function(track){
					self[self.playerName] = {};
					self[self.playerName].createdMedia = $document[0].createElement('audio');
					self[self.playerName].createdMedia.src = URL.createObjectURL(track);
					deferred.resolve();
				},function(error){
					deferred.reject(error);
					LogSrvc.logError(error);
				});
			return deferred.promise;
		},
		play: function(){
			self[self.playerName].createdMedia.play();
		},
		setVolume:function(vol,playerName){
			self[playerName].createdMedia.volume = vol;
		},
		getCurrentPosition:function(playerName){
			return self[playerName].createdMedia.currentTime;
		},
		pause:function(playerName){
			self[playerName].createdMedia.pause();
		},
		getDuration:function(playerName){
			return self[playerName].createdMedia.duration;
		},
		stop:function(playerName){
			self[playerName].createdMedia.src = '';
		}
	};

	return MediaFactory;
}]);