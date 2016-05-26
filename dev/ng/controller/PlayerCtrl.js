/*jshint -W083 */
angular.module('OEPlayer')

.controller('PlayerCtrl',['$scope','FileFactory','LogSrvc','HTTPFactory','config','StatusSrvc','$element','$rootScope','OverlaySrvc','PlayerSrvc','SettingsSrvc','$q','$timeout','$location','$interval','$http','MediaFactory','LangFactory','SocketFactory',function($scope,FileFactory,LogSrvc,HTTPFactory,config,StatusSrvc,$element,$rootScope,OverlaySrvc,PlayerSrvc,SettingsSrvc,$q,$timeout,$location,$interval,$http,MediaFactory,LangFactory,SocketFactory){
	
	$scope.lang = LangFactory;

	$scope.menu = [
		{name:'playlists',display:$scope.lang.menu.playlists,icon:'folder'},
		{name:'queue',display:$scope.lang.menu.queue,icon:'list-thumbnails'},
		{name:'schedule',display:$scope.lang.menu.schedule,icon:'calendar'},
		{name:'settings',display:$scope.lang.menu.settings,icon:'widget'}
	];

	var player;
	var socket;
	var pushToPlayTimer;
	$scope.initialising = false;
	$scope.playbackErr = 0;

	var init = function(){

		player = {};

		LogSrvc.logSystem('init called');
		$scope.status = StatusSrvc;
		$rootScope.ready = false;

		$scope.player = {
			lastPlayed:[],
			currentIndex:0,
			online:true,
			venueName:localStorage.getItem('venue')
		};
		StatusSrvc.setStatus('Loading '+$scope.player.venueName+'...');
		
		$scope.unavailableTracks = [];
		$scope.availableTracks = [];
		$scope.processingTracks = [];
		$scope.playlist = {
			tracks:[]
		};
		$scope.currentTrack = {};
		$scope.currentTrack.playerName = 'playerOne';
		$scope.pushToPlay = {
			status:false
		};
		$scope.pushToPlaySchedule = {
			status:false
		};
		$scope.energy = {
			status:false,
			level:5
		};
		$scope.player.online = $rootScope.online;

		var arrRestartTime = SettingsSrvc.restartTime.toString().split('.');
		var restartTime = {
			hour:parseInt(arrRestartTime[0]),
			min:arrRestartTime.length > 1?parseInt(arrRestartTime[1])*10:0
		};

	    var mtStart = function(){
			var nowToday = new Date();
	    	var millisTillFourAM = new Date(nowToday.getFullYear(), nowToday.getMonth(), nowToday.getDate() + 1, restartTime.hour, restartTime.min, 0, 0) - nowToday;
	    	if (millisTillFourAM < 0) {
	    	     millisTillFourAM += 86400000; // it's after midnight, try 10am tomorrow.
	    	}
		    var mtTimerStart = function(){
		    	var mtTimer = $timeout(function(){
		    		$timeout.cancel(mtTimer);
		    		mtTimer = undefined;
		    		LogSrvc.logSystem(restartTime.hour+':'+restartTime.min+'am restart');
		    		$scope.restart();
		    	},millisTillFourAM);
		    };
	    	mtTimerStart();
		};
		//start restart timer
		mtStart();
		//sockets
		if(!$scope.initialising){
			socket = new SocketFactory('wss://openear-ws.herokuapp.com');
		}
		$scope.$on('socket:open',function(event,data){
			socket.send('playerInit',null);
		});
		$scope.$on('socket:closed',function(event,data){
			socket = new SocketFactory('wss://openear-ws.herokuapp.com');
		});
		$scope.$on('socket:message',function(event,data){
			var auth = localStorage.getItem('Authentication');
			if(data.token === auth){
				switch(data.event){
					case 'manReady':
						if(!$scope.swappingTracks && $rootScope.ready){
							socket.send('ready',null);
						}
						break;
					case 'skipForward':
						if(!$scope.swappingTracks){
							$scope.skipForward();
							LogSrvc.logSystem('man app - skipForward');
						}
						break;
					case 'skipBack':
						if(!$scope.swappingTracks){
							$scope.skipBack();
							LogSrvc.logSystem('man app - skipBack');
						}
						break;
					case 'playPause':
						if(!$scope.swappingTracks){
							$scope.playPause();
							LogSrvc.logSystem('man app - playPause');
						}
						break;
					case 'restartPlayer':
						if(!$scope.swappingTracks){
							$scope.restart();
							LogSrvc.logSystem('man app - restart');
						}
						break;
					case 'pushToPlayID':
						if(!$scope.swappingTracks){
							LogSrvc.logSystem('man app - pushToPlay');
							var playlistID = data.data;
							//cancel running timer
							$interval.cancel(player[$scope.currentTrack.playerName].timer);
							player[$scope.currentTrack.playerName].timer = undefined;
							//wait
							crossfade($scope.currentTrack.playerName, SettingsSrvc.crossfadeOut,'out',true)
								.then(function(){
									$scope.pushToPlay = {
										status:true,
										end:getEndTime(SettingsSrvc.pushToPlayTime)
									};
									FileFactory.readJSON(config.local_path,'playlists.json')
										.then(function(data){
											var venue = JSON.parse(data);
											for (var i = venue.playlists.length - 1; i >= 0; i--) {
												if(venue.playlists[i].id == playlistID){
													LogSrvc.logSystem('push-to-play man');
													$scope.playlist = venue.playlists[i];
													$scope.playlist.end = getEndTime(SettingsSrvc.pushToPlayTime);
													socket.send('currentPlaylist',{name:$scope.playlist.name,ends:$scope.playlist.end,pushToPlay:true});
													shuffleArray($scope.playlist.tracks);
													$scope.player.currentIndex = 0;
													prepareNextTrack($scope.currentTrack.playerName);
													startPtpTimer();
												}
											}
										});
									
								});//hours to milliseconds, cancel push to play
						}
						break;
					case 'cancelPushToPlay':
						$scope.pushToPlay.status = false;
						$timeout.cancel(pushToPlayTimer);
						pushToPlayTimer = undefined;
						LogSrvc.logSystem('man app - push-to-play timer end');
						break;
				}
			} else {
				LogSrvc.logSystem('Not authenticated');
			}
		});
		
		FileFactory.init()
			.then(function(res){
				LogSrvc.logSystem(res);
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
			}).error(function(err){
				LogSrvc.logError(err);
				getTracksOffline();
			});
		} else {
			getPlaylists();
		}
	};

	var writeJSONFiles = function(file,data,callback){
		StatusSrvc.setStatus('Loading '+file+'...');
		FileFactory.checkFile('',file+'.json')
			.then(function(success){
				FileFactory.deleteFile('',file+'.json')
					.then(function(){
						LogSrvc.logSystem('got '+file+' delete');
						FileFactory.writeJSON(config.local_path,file+'.json',data,true)
							.then(function(){
								LogSrvc.logSystem('saved '+file);
								StatusSrvc.setStatus('Saved '+file);
								callback();
						});
					},function(){
						StatusSrvc.setStatus(file+' creation error. Please go to settings and delete stored data.');
					});
			},function(err){
				FileFactory.writeJSON(config.local_path,file+'.json',data,true)
					.then(function(){
						LogSrvc.logSystem('got '+file+' no delete');
						StatusSrvc.setStatus('Got '+file);
						callback();
					});
			});
	};

	var getPlaylists = function(){
		HTTPFactory.getPlaylists().success(function(data){
			if(data.playlists.length > 0){
				writeJSONFiles('playlists',data,getTracksOnline);
			} else {
				StatusSrvc.setStatus('No playlists. Please add some playlists to continue.');
			}
		}).error(function(err){
			LogSrvc.logError(err);
			getTracksOffline();
		});
	};

	var getPlaylistFromId = function(id){

		FileFactory.readJSON(config.local_path,'playlists.json')
			.then(function(data){
				var playlists = JSON.parse(data);
				for (var i = playlists.length - 1; i >= 0; i--) {
					if(playlists[i].id == id){
						return playlists[i];
					}
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
		}).error(function(err){
			LogSrvc.logError(err);
			getTracksOffline();
		});
	};

	var getScheduleTemplate = function(){
		HTTPFactory.getScheduleTemplate().success(function(data){
			writeJSONFiles('template',data,getSchedule);			
		}).error(function(err){
			LogSrvc.logError(err);
			getTracksOffline();
		});
	};

	var getSchedule = function(){
		HTTPFactory.getSchedule().success(function(data){
			writeJSONFiles('schedule',data,getScheduleTime);
		}).error(function(err){
			LogSrvc.logError(err);
			getTracksOffline();
		});
	};

	var getScheduleTime = function(){
		HTTPFactory.getScheduleTime().success(function(data){
			writeJSONFiles('schedule-time',data,getBlocked);
		}).error(function(err){
			LogSrvc.logError(err);
			getTracksOffline();
		});
	};

	var getBlocked = function(){
		HTTPFactory.getBlocked().success(function(data){
			writeJSONFiles('blocked',data,getTracks);
		}).error(function(err){
			LogSrvc.logError(err);
			getTracksOffline();
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
			//now check for broken tracks
			angular.forEach(tracksLocal,function(track,index){
				//check file metadata
				FileFactory.getMetadata('',track)
					.then(function(res){
						if(res.size < 2000){
							FileFactory.deleteFile('',track)
								.then(function(res){
									//remove from tracks local
									tracksLocal.splice(index,1);
									LogSrvc.logSystem(res);
								});
						}
					});
			});
			//now get set tracks
			HTTPFactory.getTracks().success(function(data){
				var tracksServer = data.tracks;
				LogSrvc.logSystem('tracks server count = '+tracksServer.length);
				//loop and remove from local arr if not in tracks
				for (var i = tracksServer.length - 1; i >= 0; i--) {
					for (var j = tracksLocal.length - 1; j >= 0; j--) {
						if(tracksLocal[j].replace('.mp3','') == tracksServer[i].id){
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
					StatusSrvc.setStatus('Remaining: '+$scope.unavailableTracks.length+' of '+$scope.tracksNeeded+' tracks');
					$scope.toDownload = parseInt($scope.tracksNeeded*0.2);
					prepareDownload();
				} else {
					//disable controls until fadein finished
					$scope.swappingTracks = true;
					preparePlaylist();
				}
			}).error(function(err){
				LogSrvc.logError(err);
				getTracksOffline();
			});
		},function(error){
			LogSrvc.logError(error);
			getTracks();
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

	var prepareDownload = function(){
		//load schedule
		FileFactory.readJSON(config.local_path,'schedule.json')
			.then(function(data){
				var schedule = JSON.parse(data);
				if(schedule.code === 0){
					downloadTracks();
				} else {
					foundPlaylist = false;
					for (var i = 0; i < schedule.playlists.length; i++) {
						if(checkPlaylistStart(schedule.playlists[i])){
							//set playlist
							foundPlaylist = i;							
							break;
						}
					}
					if(foundPlaylist !== false){
						getPlaylistTracks(schedule.playlists[foundPlaylist])
							.then(function(data){
								var currentPlaylist = data;
								var unavailableTracks = angular.copy($scope.unavailableTracks);
								$scope.unavailableTracks = [];
								
								//order download by playing playlist
								angular.forEach(unavailableTracks,function(unavailable,index){
									angular.forEach(currentPlaylist,function(current){
										if(unavailable.id == current.id){
											$scope.unavailableTracks.push(current);
											unavailableTracks.splice(index,1);
										}
									});
								});
								$scope.unavailableTracks.push.apply($scope.unavailableTracks,unavailableTracks);
								$scope.unavailableTracks.reverse();
								downloadTracks();
							});

					} else {
						downloadTracks();
					}
				}
			});
	};

	var downloadTracks = function(){
		for (var i = $scope.unavailableTracks.length - 1; i >= 0; i--) {
			downloadTrack($scope.unavailableTracks[i]);
		}
	};

	var downloadTrack = function(track){
		HTTPFactory.getTrackFile(track.file_ios.filename.src).success(function(data){
			FileFactory.writeTrack(config.local_path,track.id+'.mp3',data,true)
				.then(function(res){
					LogSrvc.logSystem(res);
					$scope.availableTracks.push(track);
					var index = $scope.unavailableTracks.indexOf(track);
					$scope.unavailableTracks.splice(index,1);
					StatusSrvc.setStatus('Remaining: '+$scope.unavailableTracks.length+' of '+$scope.tracksNeeded+' tracks');
					//if all downloaded
					if($scope.unavailableTracks.length < ($scope.tracksNeeded * 0.8) && !$scope.playing){
						$scope.swappingTracks = true;
						$scope.playing = true;
						preparePlaylist();
					} else if($scope.unavailableTracks.length < ($scope.tracksNeeded * 0.8) && $scope.playing){
						StatusSrvc.setStatus('Remaining: '+$scope.unavailableTracks.length+' of '+$scope.tracksNeeded+' tracks. Playback may be unstable.');
					}
					if($scope.unavailableTracks.length === 0){
						StatusSrvc.clearStatus();
					}
				},function(error){
					LogSrvc.logError('write download track error');
					$scope.unavailableTracks.push(track);
				});
		}).error(function(err){
			LogSrvc.logError('download track error');
			$scope.unavailableTracks.push(track);
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

	var removeBlockedTracks = function(playlist){
		FileFactory.readJSON(config.local_path,'blocked.json')
			.then(function(data){
				var blocked = JSON.parse(data);
				if(blocked.length > 0){
					for (var i = blocked.length - 1; i >= 0; i--) {
						for (var j = playlist.tracks.length - 1; j >= 0; j--) {
							if(blocked[i].track_id == playlist.tracks[j].id){
								playlist.tracks.splice(j,1);
							}
						}
					}
				}
			});
	};

	var preparePlaylist = function(fromSlider){
		StatusSrvc.setStatus('Getting playlist...');
		//reset index
		$scope.player.currentIndex = 0;
		//reset playlist
		$scope.playlist = {};
		//load schedule
		FileFactory.readJSON(config.local_path,'schedule.json')
			.then(function(data){
				LogSrvc.logSystem('getting current playlist');
			    var schedule = JSON.parse(data);
				if(schedule.code === 0){
					$rootScope.ready = true;
					LogSrvc.logSystem('no schedule - music library');
					socket.send('currentPlaylist',{name:'Music Library'});
					$scope.playlist.name = 'Music Library';
					$scope.playlist.tracks = $scope.availableTracks;
					removeBlockedTracks($scope.playlist);
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
								socket.send('currentPlaylist',{name:$scope.playlist.name,ends:$scope.playlist.end,pushToPlay:$scope.pushToPlay.status});
								$scope.playlist.tracks = data;
								removeBlockedTracks($scope.playlist);
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
						socket.send('currentPlaylist',{name:'Music Library'});
						$scope.playlist.tracks = $scope.availableTracks;
						removeBlockedTracks($scope.playlist);
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

	var checkPtpSchedule = function(playlist){
		
		var now = new Date();
		var arrTime = playlist.pivot.end.split(":");
		var diff = (arrTime[0]*60*60000)+(arrTime[1]*60000);

		if(now.getTime() - $scope.pushToPlaySchedule.start.getTime() > diff){
			return false;
		} else {
			return true;
		}
	};

	var startNextPtpSchedule = function(){
		if($scope.pushToPlaySchedule.playlistIndex < $scope.pushToPlaySchedule.schedule.length -1){
			console.log('new ptp schedule');
			$scope.pushToPlaySchedule.playlistIndex++;
			$scope.playlist = $scope.pushToPlaySchedule.schedule[$scope.pushToPlaySchedule.playlistIndex];
			$scope.playlist.playlist_id = $scope.playlist.id;
			getPlaylistTracks($scope.playlist)
				.then(function(tracks){
					$scope.playlist.tracks = tracks;
					shuffleArray($scope.playlist.tracks);
					$scope.player.currentIndex = 0;
					$interval.cancel($scope.pushToPlaySchedule.timer);
					$scope.pushToPlaySchedule.timer = undefined;
					startPtpTimerSchedule();
					loadTrack($scope.currentTrack.playerName,$scope.playlist.tracks[$scope.player.currentIndex]);
				});
		} else {
			$scope.pushToPlaySchedule.status = false;
			$interval.cancel($scope.pushToPlaySchedule.timer);
			$scope.pushToPlaySchedule.timer = undefined;
			preparePlaylist();
		}
	};

	var prepareNextTrack = function(lastPlayer){
		$scope.currentTrack.playerName = getNextPlayerName(lastPlayer);
		//now check if current playlist valid
		if($scope.pushToPlaySchedule.status){
			if(checkPtpSchedule($scope.playlist)){
				if($scope.player.currentIndex >= $scope.playlist.tracks.length - 1){
					$scope.player.currentIndex = 0;
				} else {
					$scope.player.currentIndex++;
				}
				loadTrack($scope.currentTrack.playerName,$scope.playlist.tracks[$scope.player.currentIndex]);
			} else {
				startNextPtpSchedule();
			}
		}else if(checkPlaylistStart($scope.playlist) || $scope.pushToPlay.status || $scope.energy.status){
			//reset index if past length
			if($scope.player.currentIndex >= $scope.playlist.tracks.length - 1){
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
			}).error(function(err){
				LogSrvc.logError(err);
				var backlog = JSON.parse(localStorage.getItem('backlog'));
				if(backlog){
					backlog.push(track.id);
				} else {
					backlog = [track.id];
				}
				localStorage.setItem('backlog',JSON.stringify(backlog));
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

		try{
			//sockets
			socket.send('currentTrack',{title:track.title,artist:track.artist});

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
							socket.send('ready',null);
						});
					if(!$scope.initialising){
						var checkTimeout = $timeout(function(){
							var checkPlaying = function(){
								var position = player[playerName].getCurrentPosition(playerName);
								if(position < 1){
									//reinitialise the file system
									LogSrvc.logError('playback error count - '+$scope.playbackErr);
									$scope.playbackErr++;
									if($scope.playbackErr > 5){
										LogSrvc.logError('playback error - Restarting');
										window.location.reload();
									} else {
										$interval.cancel(player[playerName].timer);
										player[playerName].timer = undefined;
										prepareNextTrack(playerName);
									}
								} else {
									LogSrvc.logSystem('track '+$scope.currentTrack.title+' playing');
								}
								$timeout.cancel(checkTimeout);
							};
							checkPlaying();
						},SettingsSrvc.crossfadeIn*10);
					}
					startTimer(playerName);
				},function(error){
					LogSrvc.logError(error);
					prepareNextTrack(playerName);
				});
		}
		catch(e){
			LogSrvc.logError(e);
			prepareNextTrack(playerName);
		}
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
		socket.send('swappingTracks',null);
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
		socket.send('lastPlayed',track);
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
			LogSrvc.logSystem('Restarting player');
			window.location.reload();
		});
	};

	$scope.playPause = function(){
		if($scope.currentTrack.isPaused){
			player[$scope.currentTrack.playerName].play($scope.currentTrack.playerName);
			crossfade($scope.currentTrack.playerName,50,'in',true).then(function(){
				$scope.currentTrack.isPaused = !$scope.currentTrack.isPaused;
				$scope.swappingTracks = false;
				socket.send('ready',null);
				socket.send('currentTrack',$scope.currentTrack);
			});
		} else {
			crossfade($scope.currentTrack.playerName,50,'out',true,true).then(function(){
				player[$scope.currentTrack.playerName].pause($scope.currentTrack.playerName);
				$scope.currentTrack.isPaused = !$scope.currentTrack.isPaused;
				$scope.swappingTracks = false;
				socket.send('ready',null);
				socket.send('currentTrack',$scope.currentTrack);
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
		$scope.swappingTracks = true;
		//fade out
		crossfade($scope.currentTrack.playerName, SettingsSrvc.skipCrossfadeOut,'out',false).then(function(){
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
		$scope.swappingTracks = true;
		//fade out
		crossfade($scope.currentTrack.playerName, SettingsSrvc.skipCrossfadeOut,'out',false).then(function(){
			prepareNextTrack($scope.currentTrack.playerName);
		});
	};

	$scope.cancelPushToPlay = function(){
		$scope.pushToPlay.status = false;
		$timeout.cancel(pushToPlayTimer);
		pushToPlayTimer = undefined;
		LogSrvc.logSystem('push-to-play timer end');
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

		var data;

		switch(template){
			case 'queue':
				data = $scope.playlist.tracks;
				break;
		}
		
		for (var i = $scope.menu.length - 1; i >= 0; i--) {
			if($scope.menu[i].name == template && !$scope.menu[i].active){
				$scope.menu[i].active = true;
				OverlaySrvc.open(template,data);
			} else if($scope.menu[i].name == template && $scope.menu[i].active){
				$scope.menu[i].active = false;
				OverlaySrvc.close();
			} else {
				$scope.menu[i].active = false;
			}
		}
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
		//cancel ptp schedule
		$scope.pushToPlaySchedule.status = false;
		//cancel running timer
		$interval.cancel(player[$scope.currentTrack.playerName].timer);
		player[$scope.currentTrack.playerName].timer = undefined;
		//wait
		crossfade($scope.currentTrack.playerName, SettingsSrvc.crossfadeOut,'out',true)
			.then(function(){
				$scope.pushToPlay = {
					status:true,
					end:getEndTime(SettingsSrvc.pushToPlayTime)
				};
				$scope.playlist = angular.copy(PlayerSrvc.playlist);
				$scope.playlist.end = getEndTime(SettingsSrvc.pushToPlayTime);
				shuffleArray($scope.playlist.tracks);
				$scope.player.currentIndex = -1;
				prepareNextTrack($scope.currentTrack.playerName);
				startPtpTimer();
			});//hours to milliseconds, cancel push to play
	});
	var startPtpTimer = function(){
		var time = SettingsSrvc.pushToPlayTime*3600000;
		//set timeout for push to play
		var startTimer = function(){
			pushToPlayTimer = $timeout(function(){
				$scope.pushToPlay.status = false;
				$timeout.cancel(pushToPlayTimer);
				pushToPlayTimer = undefined;
				LogSrvc.logSystem('push-to-play timer end');
			},time);
		};
		startTimer();
	};
	$scope.$on('$destroy', unbindPushToPlay);

	//push to play schedule
	var unbindPtpSchedule = $rootScope.$on('ptp-schedule',function(){
		//cancel pust to play if running
		$scope.pushToPlay.status = false;
		//cancel running timer
		$interval.cancel(player[$scope.currentTrack.playerName].timer);
		player[$scope.currentTrack.playerName].timer = undefined;
		//wait
		crossfade($scope.currentTrack.playerName, SettingsSrvc.crossfadeOut,'out',true)
			.then(function(){
				var start = new Date();
				$scope.pushToPlaySchedule = {
					status:true,
					playlistIndex:0,
					schedule:PlayerSrvc.schedule,
					start:start
				};

				$scope.playlist = $scope.pushToPlaySchedule.schedule[$scope.pushToPlaySchedule.playlistIndex];
				$scope.playlist.playlist_id = $scope.playlist.id;
				getPlaylistTracks($scope.playlist)
					.then(function(tracks){
						$scope.playlist.tracks = tracks;
						shuffleArray($scope.playlist.tracks);
						$scope.player.currentIndex = -1;
						prepareNextTrack($scope.currentTrack.playerName);
						startPtpTimerSchedule();
					});
			});
	});
	var startPtpTimerSchedule = function(){
		var arrTimeStart = $scope.playlist.pivot.start.split(":");
		var arrTimeEnd = $scope.playlist.pivot.end.split(":");
		var ms = (arrTimeEnd[0]*60*60000 + arrTimeEnd[1]*60000) - (arrTimeStart[0]*60*60000 + arrTimeStart[1]*60000);
		//set timeout for push to play
		var startTimer = function(){
			$scope.pushToPlaySchedule.timer = $interval(function(){
				if(ms > 0){
					ms = ms-1000;
					$scope.playlist.end = msToMinSec(ms);
				} else {
					$scope.playlist.end = 'ENDED';
					$interval.cancel($scope.pushToPlaySchedule.timer);
					$scope.pushToPlaySchedule.timer = undefined;
				}
			},1000);
		};
		startTimer();
	};
	var msToMinSec = function(ms){
		var minutes = Math.floor(ms / 60000);
  		var seconds = ((ms % 60000) / 1000).toFixed(0);
  		return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
	};

	$scope.$on('$destroy', unbindPtpSchedule);

	var getEndTime = function(hours){
		return moment().add(hours,'h').format('HH:mm:ss');
	};

	//energise
	$scope.energise = function(){
		$scope.energy.status = !$scope.energy.status;
		if($scope.energy.status){
			energisePlaylist();
		}else {
			if($scope.pushToPlay.status){
				$scope.player.currentIndex = 0;
				$scope.playlist = angular.copy(PlayerSrvc.playlist);
				$scope.playlist.end = $scope.pushToPlay.end;
				shuffleArray($scope.playlist.tracks);
			} else {
				preparePlaylist(true);
			}
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
			player[$scope.currentTrack.playerName].pause($scope.currentTrack.playerName);
			$http.defaults.headers.common.Authentication = '';
			localStorage.removeItem('Authentication');
			localStorage.removeItem('venue');
			socket.endConnection();
			$location.path('/login');
		}
	};
	//global stop playback
	var unbindglobalpause = $rootScope.$on('global-pause',function(){
		player[$scope.currentTrack.playerName].pause($scope.currentTrack.playerName);
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
