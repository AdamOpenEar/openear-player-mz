/*jshint -W083 */
angular.module('OEPlayer')

.controller('PlayerCtrl',['$scope','FileFactory','LogSrvc','HTTPFactory','config','StatusSrvc','$element','$rootScope','OverlaySrvc','PlayerSrvc','SettingsSrvc','$q','$timeout','$location','$interval','$http','MediaFactory','LangFactory',function($scope,FileFactory,LogSrvc,HTTPFactory,config,StatusSrvc,$element,$rootScope,OverlaySrvc,PlayerSrvc,SettingsSrvc,$q,$timeout,$location,$interval,$http,MediaFactory,LangFactory){
	
	$scope.lang = LangFactory;

	$scope.menu = [
		{name:'playlists',display:$scope.lang.menu.playlists,icon:'folder'},
		{name:'queue',display:$scope.lang.menu.queue,icon:'list-thumbnails'},
		{name:'schedule',display:$scope.lang.menu.schedule,icon:'calendar'},
		{name:'settings',display:$scope.lang.menu.settings,icon:'widget'}
	];

	var player = {};

	var init = function(){
		StatusSrvc.setStatus('Loading...');
		LogSrvc.logSystem('init called');
		$scope.status = StatusSrvc;
		$rootScope.ready = false;

		$scope.player = {
			lastPlayed:[],
			currentIndex:0,
			online:true
		};
		
		$scope.unavailableTracks = [];
		$scope.availableTracks = [];
		$scope.processingTracks = [];
		$scope.playlist = {
			tracks:[]
		};
		$scope.currentTrack = {};
		$scope.currentTrack.playerName = 'playerOne';
		$scope.pushToPlay = false;
		$scope.energy = {
			status:false,
			level:5
		};
		$scope.player.online = $rootScope.online;
		FileFactory.init()
			.then(function(){
				getSetttings();
			},function(error){
				LogSrvc.logError(error);
			});
	};

	//watch online status
	$scope.$watch('online', function(newStatus) {
		$scope.player.online = newStatus;
	});

	var getSetttings = function(){
		//if animations on
		if(SettingsSrvc.animations == 1){
			$element.addClass('animations');
		} else {
			$element.removeClass('animations');
		}
		if($scope.player.online){
			processBacklog();
		} else {
			getTracksOffline();
		}
	};

	var processBacklog = function(){
		var backlog = JSON.parse(localStorage.getItem('backlog'));
		if(backlog){
			HTTPFactory.logTrack({logs:backlog}).success(function(){
				localStorage.removeItem('backlog');
				getPlaylists();
			});
		} else {
			getPlaylists();
		}
	};

	var writeJSONFiles = function(file,data,callback){
		FileFactory.checkFile('',file+'.json')
			.then(function(success){
				FileFactory.deleteFile('',file+'.json')
					.then(function(){
						FileFactory.writeJSON(config.local_path,file+'.json',data,true)
							.then(function(){
								LogSrvc.logSystem('got '+file);
								callback();
						});
					},function(){
						StatusSrvc.setStatus(file+' creation error. Please go to settings and delete stored data.');
					});
			},function(err){
				FileFactory.writeJSON(config.local_path,'playlists.json',data,true)
					.then(function(){
						LogSrvc.logSystem('got '+file);
						callback();
					});
			});
	}

	var getPlaylists = function(){
		HTTPFactory.getPlaylists().success(function(data){
			$scope.player.venueName = data.name;
			if(data.playlists.length > 0){
				writeJSONFiles('playlists',data,getTracksOnline);
			} else {
				StatusSrvc.setStatus('No playlists. Please add some playlists to continue.');
			}
		});
	};

	var getTracksOnline = function(){
		HTTPFactory.getTracks().success(function(data){
			if(data.tracks.length > 0){
				writeJSONFiles('tracks',data,getScheduleTemplate);
			} else {
				StatusSrvc.setStatus('No tracks associated with playlists. Please add music to your playlists.');
			}
		});
	};

	var getScheduleTemplate = function(){
		HTTPFactory.getScheduleTemplate().success(function(data){
			writeJSONFiles('template',data,getSchedule);			
		});
	};

	var getSchedule = function(){
		HTTPFactory.getSchedule().success(function(data){
			writeJSONFiles('schedule',data,getBlocked);
		});
	};

	var getBlocked = function(){
		HTTPFactory.getBlocked().success(function(data){
			writeJSONFiles('blocked',data,getTracks);
		});
	};

	var getTracks = function(){
		//local tracks array
		var tracksLocal = [];
		//read current library
		FileFactory.readDirectory('').then(function(data){
			LogSrvc.logSystem('got local tracks');
			//loop local files and push to local track array
			if(data.length > 0){
				for (var i = data.length - 1; i >= 0; i--) {
					if(data[i].name.indexOf('.json') == -1){
						tracksLocal.push(data[i].name);
					}
				}
			}
			//count local tracks
			LogSrvc.logSystem('tracks local count = '+tracksLocal.length);
			//now get set tracks
			HTTPFactory.getTracks().success(function(data){
				var tracksServer = data.tracks;
				LogSrvc.logSystem('tracks server count = '+tracksServer.length);
				//loop and remove from local arr if not in tracks
				for (var i = tracksServer.length - 1; i >= 0; i--) {
					for (var j = tracksLocal.length - 1; j >= 0; j--) {
						//remove duff files
						if(tracksLocal[j].indexOf('.mp3') == -1){
							FileFactory.deleteFile('',tracksLocal[j])
							.then(function(res){
								LogSrvc.logSystem(res);
							});
						}else if(tracksLocal[j].replace('.mp3','') == tracksServer[i].id){
							//we have the file so no need to get
							$scope.availableTracks.push(tracksServer[i]);
							tracksLocal.splice(j,1);
						}
					}
				}
				//loop what's left and remove from local storage
				if(tracksLocal.length > 0){
					LogSrvc.logSystem('delete local tracks length = '+tracksLocal.length);
					for (var k = tracksLocal.length - 1; k >= 0; k--) {
						FileFactory.deleteFile('',tracksLocal[k])
							.then(function(res){
								LogSrvc.logSystem(res);
							});
					}
				}
				//now loop again and set unavailable tracks
				for (var l = $scope.availableTracks.length - 1; l >= 0; l--) {
					for (var m = tracksServer.length - 1; m >= 0; m--) {
						if($scope.availableTracks[l].id == tracksServer[m].id){
							tracksServer.splice(m,1);
						}
					}
				}
				
				$scope.unavailableTracks = tracksServer;
				$scope.tracksNeeded = tracksServer.length;
				//set status
				if($scope.unavailableTracks.length > 0){
					StatusSrvc.setStatus('Dowloading track '+$scope.unavailableTracks.length+' of '+$scope.tracksNeeded+' tracks');
					downloadTrack($scope.unavailableTracks[0]);
				} else {
					//disable controls until fadein finished
					$scope.swappingTracks = true;
					preparePlaylist();
				}
			});
		},function(error){
			LogSrvc.logError(error);
		});
	};

	var getTracksOffline = function(){
		//read current library
		FileFactory.readJSON(config.local_path,'tracks.json')
            .then(function(data){
            	var d = JSON.parse(data);
                $scope.availableTracks = d.tracks;
                $scope.swappingTracks = true;
				preparePlaylist();
            },function(error){
				LogSrvc.logError(error);
			});
	};

	var downloadTrack = function(track){
		HTTPFactory.getTrackFile(track.file_ios.filename.src).success(function(data){
			FileFactory.writeTrack(config.local_path,track.id+'.mp3',data,true)
				.then(function(res){
					LogSrvc.logSystem(res);
					getNextTrack(track);
				},function(error){
					LogSrvc.logError(error);
				});
		}).error(function(err){
			LogSrvc.logError(err);
			HTTPFactory.reprocessFile(track).success(function(){
				$scope.processingTracks.push(track);
				getNextTrack(track);
			});
		});
	};

	var getTrack = function(track){
		LogSrvc.logSystem('get track');
		LogSrvc.logSystem(track);
		FileFactory.checkFile('',track.id)
			.then(function(success){
				LogSrvc.logSystem(success);
				getNextTrack(track);
			},function(error){
				LogSrvc.logSystem(error);
				downloadTrack(track);
			});
	};

	var getNextTrack = function(track){
		$scope.availableTracks.push(track);
		var index = $scope.unavailableTracks.indexOf(track);
		$scope.unavailableTracks.splice(index,1);
		StatusSrvc.setStatus('Getting track '+$scope.unavailableTracks.length+' of '+$scope.tracksNeeded+' tracks');
		//check here for proportion of available to play from
		if($scope.unavailableTracks.length > 0){
			downloadTrack($scope.unavailableTracks[0]);
		} else {
			//disable controls until fadein finished
			$scope.swappingTracks = true;
			StatusSrvc.clearStatus();
			preparePlaylist();
		}
	};

	var checkPlaylistStart = function(playlist){

		//if playlist is for today
		var now = moment();
		var time = getTime();

		if(playlist.day == (now.weekday() === 0 ? 7 : now.weekday() - 1)){
			//if start and end of playlist between now
			if(playlist.midnight_overlap == 1){
				if(playlist.start <= time && time < '23:59:59'){
					return true;
				} else if(playlist.start <= time && playlist.end >= time){
					return true;
				} else {
					return false;
				}	
			} else {
				if(playlist.start <= time && playlist.end >= time){
					return true;
				} else {
					return false;
				}
			}
		}
	};

	var getPlaylistTracks = function(playlist){
		var deferred = $q.defer();
		FileFactory.readJSON(config.local_path,'playlists.json')
			.then(function(data){
				var venue = JSON.parse(data);
				
				for (var i = 0; i < venue.playlists.length; i++) {
					if(venue.playlists[i].id == playlist.playlist_id){
						deferred.resolve(venue.playlists[i].tracks);
						break;
					}
				}
				deferred.reject();
			});
		return deferred.promise;
	};

	var preparePlaylist = function(fromSlider){
		StatusSrvc.setStatus('Getting playlist...');
		//reset index
		$scope.player.currentIndex = 0;
		//remove processing files
		if($scope.processingTracks.length > 0){
			for (var i = $scope.availableTracks.length - 1; i >= 0; i--) {
				for (var j = $scope.processingTracks.length - 1; j >= 0; j--) {
					var index = $scope.availableTracks.indexOf($scope.processingTracks[j]);
					if(index > -1){
						$scope.availableTracks.splice(index,1);
					}
				}
			}
		}
		//load schedule
		FileFactory.readJSON(config.local_path,'schedule.json')
			.then(function(data){
				LogSrvc.logSystem('getting current playlist');
			    var schedule = JSON.parse(data);
				if(schedule.code === 0){
					$rootScope.ready = true;
					LogSrvc.logSystem('no playlist - music library');
					$scope.playlist.name = 'Music Library';
					$scope.playlist.tracks = $scope.availableTracks;
					shuffleArray($scope.playlist.tracks);
					StatusSrvc.clearStatus();
					if(!fromSlider){
						loadTrack($scope.currentTrack.playerName,$scope.playlist.tracks[$scope.player.currentIndex]);
					}
				} else {
					foundPlaylist = false;
					for (var i = 0; i < schedule.playlists.length; i++) {
						if(checkPlaylistStart(schedule.playlists[i])){
							//set playlist
							foundPlaylist = i;							
							break;
						}
					}
					$rootScope.ready = true;
					//found a scheduled playlist
					if(foundPlaylist !== false){
						LogSrvc.logSystem('got playlist');
						getPlaylistTracks(schedule.playlists[foundPlaylist])
							.then(function(data){
								$scope.playlist = schedule.playlists[i].playlist;
								$scope.playlist.tracks = data;
								shuffleArray($scope.playlist.tracks);
								StatusSrvc.clearStatus();
								if(!fromSlider){
									loadTrack($scope.currentTrack.playerName,$scope.playlist.tracks[$scope.player.currentIndex]);
								}
							},function(error){
								LogSrvc.logError(error);
							});
					//if we didn't find a playlist, go to library
					} else {
						LogSrvc.logSystem('no playlist - music library');
						$scope.playlist.name = 'Music Library';
						$scope.playlist.tracks = $scope.availableTracks;
						shuffleArray($scope.playlist.tracks);
						StatusSrvc.clearStatus();
						if(!fromSlider){
							loadTrack($scope.currentTrack.playerName,$scope.playlist.tracks[$scope.player.currentIndex]);
						}
					}
				}
				
			},function(error){
				LogSrvc.logSystem(error);
			});
	};

	var energisePlaylist = function(){

		$scope.playlist.name = 'Energy set at '+$scope.energy.level;
		$scope.player.currentIndex = 0;
		$scope.playlist.tracks = [];
		var energy = parseInt($scope.energy.level);
		$scope.energy.increment = energy + 1;
		$scope.energy.decrement = energy - 1;
		fillEnergyPlaylist(energy,true);
		shuffleArray($scope.playlist.tracks);
	};

	var fillEnergyPlaylist = function(energy,direction){

		for (var i = 0; i < $scope.availableTracks.length; i++) {
			if($scope.availableTracks[i].energy == energy){
				$scope.playlist.tracks.push($scope.availableTracks[i]);
			}
		}
		if($scope.playlist.tracks.length < SettingsSrvc.minEnergyPlaylist){
			if($scope.energy.increment > 10){
				direction = false;
			} else if($scope.energy.decrement < 0){
				direction = true;
			}
			fillEnergyPlaylist(direction ? $scope.energy.increment++ : $scope.energy.decrement--,!direction);
		}
	};

	var prepareNextTrack = function(lastPlayer){
		$scope.currentTrack.playerName = getNextPlayerName(lastPlayer);
		//now check if current playlist valid
		if(checkPlaylistStart($scope.playlist) || $scope.pushToPlay || $scope.energy.status){
			//reset index if past length
			if($scope.player.currentIndex > $scope.playlist.tracks.length - 1){
				$scope.player.currentIndex = 0;
			} else {
				$scope.player.currentIndex++;
			}
			loadTrack($scope.currentTrack.playerName,$scope.playlist.tracks[$scope.player.currentIndex]);
		} else {
			//finished, start next playlist
			preparePlaylist();
		}
	};

	var logTrack = function(track){
		if($scope.player.online){
			HTTPFactory.logTrack({logs:[track.id]}).success(function(){
				LogSrvc.logSystem('Track '+track.title+' logged');
			});
		} else {
			var backlog = JSON.parse(localStorage.getItem('backlog'));
			if(backlog){
				backlog.push(track.id);
			} else {
				backlog = [track.id];
			}

			localStorage.setItem('backlog',JSON.stringify(backlog));
		}
	};

	var loadTrack = function(playerName,track){

		$scope.initialising = false;
		LogSrvc.logSystem('playing '+track.id+' player name '+playerName);
		$scope.currentTrack = track;
		$scope.currentTrack.playerName = playerName;
		var duration;
		$scope.timer = {elapsed:'0:00',duration:'0:00'};

		var src = track.id+config.file_extention;
		player[playerName] = new MediaFactory(playerName);
		player[playerName].init(src)
			.then(function(){
				player[playerName].setVolume(0,playerName);
				player[playerName].play();
				crossfade(playerName,SettingsSrvc.crossfadeIn,'in',true)
					.then(function(){
						$scope.swappingTracks = false;
					});
				startTimer(playerName);
			},function(error){
				LogSrvc.logError(error);
				prepareNextTrack(playerName);
			});
	};
	var startTimer = function(playerName){
		player[playerName].timer = $interval(function(){
			//just a timer
			var getElapsed = function(){
				var position = player[playerName].getCurrentPosition(playerName);
				if (position > -1) {
					$scope.timer.durationSec = parseInt(player[playerName].getDuration(playerName));
					$scope.timer.duration = getSecMin(
						parseInt($scope.timer.durationSec % 60),
						parseInt(($scope.timer.durationSec / 60) % 60)
					);
					$scope.timer.elapsedSec = parseInt(position);
					$scope.timer.elapsed = getSecMin(
						parseInt(position % 60),
						parseInt((position / 60) % 60)
					);
					if(parseInt(position) + 10 > $scope.timer.durationSec && $scope.timer.durationSec > 0){
						$interval.cancel(player[playerName].timer);
						player[playerName].timer = undefined;
						LogSrvc.logSystem('next track');
						$scope.swappingTracks = true;
						crossfade(playerName,SettingsSrvc.crossfadeOut,'out',false)
							.then(function(){
								addToLastPlayed($scope.currentTrack);
								logTrack($scope.currentTrack);
								console.log('prepare name='+playerName);
								prepareNextTrack(playerName);
							});
					}
				}
			};
			//closure
			getElapsed();
		},1000);
	};
	var crossfade = function(playerName,time,direction,wait,pause){

		var deferred = $q.defer();
		var vol = (direction == 'out') ? 1 : 0;
		$scope.swappingTracks = true;
		if(!wait){
			deferred.resolve();
		}

		var cfTimer = $interval(function(){
			//set direction
			var cfFunc = function(){
				if(direction === 'out'){
					vol = vol - 0.1;
					if(vol > 0){
						player[playerName].setVolume(vol.toFixed(1),playerName);
					} else {
						$interval.cancel(cfTimer);
						cfTimer = undefined;
						player[playerName].setVolume(0,playerName);
						if(!pause){
							player[playerName].stop(playerName);
						}
						if(wait){
							deferred.resolve();
						}
					}
				} else {
					vol = vol + 0.1;
					if(vol < 1){
						player[playerName].setVolume(vol.toFixed(1),playerName);
					} else {
						$interval.cancel(cfTimer);
						cfTimer = undefined;
						player[playerName].setVolume(1,playerName);
						if(wait){
							deferred.resolve();
						}
					}
				}
			};
			cfFunc();
			
		},time);

		return deferred.promise;
	};

	var addToLastPlayed = function(track){
		track.time = getTime();
		if($scope.player.lastPlayed.length > 50){
			$scope.player.lastPlayed.splice($scope.player.lastPlayed.length - 1,1);
			$scope.player.lastPlayed.unshift(track);
		} else {
			$scope.player.lastPlayed.unshift(track);
		}
	};

	var secToSecMin = function(time){
		var secmin;
		var s = parseInt(time % 60);
		var m = parseInt((time / 60) % 60);
	    if (s < 10) {
	        secmin = m + ':0' + s;
	    }
	    else {
	        secmin = m + ':' + s;
	    }
	    return secmin;
	};

	var getSecMin = function(s,m){
		var secmin;
	    if (s < 10) {
	        secmin = m + ':0' + s;
	    }
	    else {
	        secmin = m + ':' + s;
	    }
	    return secmin;
	};


	var getNextPlayerName = function(playerName){
		if(playerName == 'playerOne'){
			return 'playerTwo';
		} else {
			return 'playerOne';
		}
	};

	var getTime = function(){
		return moment().format('HH:mm:ss');
	};

	var shuffleArray = function(array) {

	  	var m = array.length, t, i;

	  	// While there remain elements to shuffle
	  	while (m) {
    		// Pick a remaining element…
	    	i = Math.floor(Math.random() * m--);

	    	// And swap it with the current element.
	    	t = array[m];
	    	array[m] = array[i];
	    	array[i] = t;
	  	}

	  	return array;
	};
	//initialise player
	init();

	//PLAYBACK CONTROLS
	$scope.restart = function(){
		//add to last played
		addToLastPlayed($scope.currentTrack);
		//stop timer
		$interval.cancel(player[$scope.currentTrack.playerName].timer);
		player[$scope.currentTrack.playerName].timer = undefined;
		$scope.initialising = true;
		//fade out
		crossfade($scope.currentTrack.playerName, SettingsSrvc.skipCrossfadeOut,'out',true).then(function(){
			init();
		});
	};

	$scope.playPause = function(){
		if($scope.currentTrack.isPaused){
			player[$scope.currentTrack.playerName].play($scope.currentTrack.playerName);
			crossfade($scope.currentTrack.playerName,50,'in',true).then(function(){
				$scope.currentTrack.isPaused = !$scope.currentTrack.isPaused;
				$scope.swappingTracks = false;
			});
		} else {
			crossfade($scope.currentTrack.playerName,50,'out',true,true).then(function(){
				player[$scope.currentTrack.playerName].pause($scope.currentTrack.playerName);
				$scope.currentTrack.isPaused = !$scope.currentTrack.isPaused;
				$scope.swappingTracks = false;
			});
		}
	};

	$scope.skipForward = function(){

		//stop timer
		$interval.cancel(player[$scope.currentTrack.playerName].timer);
		player[$scope.currentTrack.playerName].timer = undefined;
		//add to last played
		addToLastPlayed($scope.currentTrack);
		logTrack($scope.currentTrack);
		//fade out
		crossfade($scope.currentTrack.playerName, SettingsSrvc.skipCrossfadeOut,'out',true).then(function(){
			prepareNextTrack($scope.currentTrack.playerName);
		});

	};

	$scope.skipBack = function(){
		//add to last played
		addToLastPlayed($scope.currentTrack);
		logTrack($scope.currentTrack);
		//stop timer
		$interval.cancel(player[$scope.currentTrack.playerName].timer);
		player[$scope.currentTrack.playerName].timer = undefined;
		//change index
		$scope.player.currentIndex = $scope.player.currentIndex - 2;
		//fade out
		crossfade($scope.currentTrack.playerName, SettingsSrvc.skipCrossfadeOut,'out',true).then(function(){
			prepareNextTrack($scope.currentTrack.playerName);
		});
	};

	//LAST TRACK OVERLAY
	$scope.openLastTracks = function(element){
		if($scope.lastTracksOpen){
			$element.removeClass('active-last-played');
		} else {
			$element.addClass('active-last-played');
		}
		$scope.lastTracksOpen = !$scope.lastTracksOpen;
	};
	//OVERLAY CONTROLS
	$scope.openOverlay = function(template){

		for (var i = $scope.menu.length - 1; i >= 0; i--) {
			if($scope.menu[i].name == template){
				$scope.menu[i].active = true;
			} else {
				$scope.menu[i].active = false;
			}
		}
		var data;

		switch(template){
			case 'queue':
				data = $scope.playlist.tracks;
				break;
		}
		OverlaySrvc.open(template,data);
	};

	var unbindOpen = $rootScope.$on('open-overlay',function(){
		$element.addClass('overlay-active');
	});

	var unbindClose = $rootScope.$on('close-overlay',function(){
		$element.removeClass('overlay-active');
		for (var i = $scope.menu.length - 1; i >= 0; i--) {
			$scope.menu[i].active = false;
		}
	});

	$scope.$on('$destroy', unbindOpen);
	$scope.$on('$destroy', unbindClose);

	//push to play
	var unbindPushToPlay = $rootScope.$on('push-to-play',function(){
		//cancel running timer
		$interval.cancel(player[$scope.currentTrack.playerName].timer);
		player[$scope.currentTrack.playerName].timer = undefined;
		//wait
		crossfade($scope.currentTrack.playerName, SettingsSrvc.crossfadeOut,'out',true)
			.then(function(){
				$scope.pushToPlay = true;
				$scope.playlist = PlayerSrvc.playlist;
				$scope.playlist.end = getEndTime(SettingsSrvc.pushToPlayTime);
				shuffleArray($scope.playlist.tracks);
				$scope.player.currentIndex = 0;
				loadTrack($scope.currentTrack.playerName,$scope.playlist.tracks[$scope.player.currentIndex]);
				//set timeout for push to play
				var pushToPlayTimer = $timeout(function(){
					$scope.pushToPlay = false;
					crossfade($scope.currentTrack.playerName, SettingsSrvc.crossfadeOut,'out').then(function(){
						preparePlaylist();
						$timeout.cancel(pushToPlayTimer);
						pushToPlayTimer = undefined;
					});
				},SettingsSrvc.pushToPlayTime*60*60*100);
			});//hours to milliseconds, cancel push to play
	});
	$scope.$on('$destroy', unbindPushToPlay);

	var getEndTime = function(hours){
		return moment().add(hours,'h').format('HH:mm:ss');
	}

	//energise
	$scope.energise = function(){
		$scope.energy.status = !$scope.energy.status;
		if($scope.energy.status){
			energisePlaylist();
		} else {	
			preparePlaylist(true);
		}
	};

	$scope.changeEnergy = function(){
		$timeout(function(){
			energisePlaylist();
		},1000);
	};
	//block track
	$scope.blockTrack = function(track){
		var c = confirm('Are you sure you want to block this track?');
		if(c){
			for (var i = $scope.playlist.tracks.length - 1; i >= 0; i--) {
				if($scope.playlist.tracks[i].id == track.id){
					$scope.playlist.tracks.splice(i,1);
				}
			}
			//set blocked on local storage if offline - sent on init
			HTTPFactory.blockTrack(track.id).success(function(){
				track.blocked = true;
			},function(){
				var blocked = JSON.parse(localStorage.getItem('blocked'));
				blocked.push(track.id);
				localStorage.setItem(blocked);
			});
		}
	};
	//logoff
	$scope.logOff = function(){
		var c = confirm($scope.lang.menu.conflogout);
		if(c){
			$scope.playPause();
			$http.defaults.headers.common.Authentication = '';
			window.localStorage.removeItem('Authentication');
			$location.path('/login');
		}
	};
	//global stop playback
	var unbindglobalpause = $rootScope.$on('global-pause',function(){
		$scope.playPause();
	});
	$scope.$on('$destroy', unbindglobalpause);
}])
.directive("ngTouchend", function () {
  return {
    controller: function ($scope, $element, $attrs) {
      $element.bind('touchend', onTouchEnd);
      
		function onTouchEnd(event) {
			var method = $element.attr('ng-touchend');
			$scope.$event = event;
			$scope.$apply(method);
		}
    }
  };
})
.directive('onFinishRender', ['$timeout',function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    };
}]);
