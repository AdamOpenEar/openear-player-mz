angular.module('OEPlayer')
.factory('MediaFactory',['$document','$rootScope','PlayerSrvc','$interval','$q','FileFactory','config','LogSrvc','SettingsSrvc',function($document,$rootScope,PlayerSrvc,$interval,$q,FileFactory,config,LogSrvc,SettingsSrvc){

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
					self[self.playerName].createdMedia.setSinkId(SettingsSrvc.outputDevice)
						.then(function(){
							deferred.resolve();		
						})
						.catch(function(err){
							LogSrvc.logError(err);
							self[self.playerName].createdMedia.setSinkId('default');
							SettingsSrvc.setSetting('outputDevice','default');
							deferred.resolve();
						});
					
				},function(error){
					deferred.reject(error);
					LogSrvc.logError(error);
				});
			return deferred.promise;
		},
		play: function(){
			self[self.playerName].createdMedia.play();
		},
		isPlaying:function(playerName){
			return !self[self.playerName].createdMedia.paused;
		},
		setVolume:function(vol,playerName){
			self[playerName].createdMedia.volume = parseFloat(vol);
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
			if(typeof self[playerName] !== 'undefined'){
				URL.revokeObjectURL(self[playerName].createdMedia.src);
				self[playerName].createdMedia.src = '';
			}
		}
	};

	return MediaFactory;
}]);
