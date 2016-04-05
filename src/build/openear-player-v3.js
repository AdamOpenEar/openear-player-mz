angular.module('OEPlayer',[
    'ngRoute',
    'angular-svg-round-progress',
    'angularMoment',
    'templates'
])
.config(['$httpProvider','$routeProvider',function($httpProvider,$routeProvider) {

    $routeProvider.when('/login', {
        templateUrl: 'login.html',
        controller: 'LoginCtrl'
    }).when('/player',{
        templateUrl:'player.html'
    }).otherwise('/login');

    $httpProvider.interceptors.push("HttpErrorInterceptorModule");

}])
.run(['$rootScope','$location','$http','$window',function($rootScope,$location,$http,$window){

    $rootScope.$on('$routeChangeStart', function(event, next, current) {
        if(localStorage.getItem('Authentication')){
            $http.defaults.headers.common.Authentication = localStorage.getItem('Authentication');
        } else {
            $location.path( '/login' );
        }
    });
    //check if online
    $rootScope.online = navigator.onLine;
    $window.addEventListener("offline", function () {
        $rootScope.$apply(function() {
            $rootScope.online = false;
        });
      }, false);
    $window.addEventListener("online", function () {
        $rootScope.$apply(function() {
            $rootScope.online = true;
        });
      }, false);
}])
.constant('config',{
    'api_url':'https://www.openearmusic.com/api/ios/',
    'module_dir':'ng',
    'local_path':'/',
    'file_extention':'.mp3',
    'log_path':'https://www.openearmusic.com/api/ios/log-track',
    'version':'3.1.1-0.1.3'
})
.controller('AppCtrl',['config','$scope',function(config,$scope){
    $scope.version = config.version;
}]);;angular.module('OEPlayer')
.controller('LogCtrl',['$scope','LogSrvc','$rootScope',function($scope,LogSrvc,$rootScope){

	$scope.logs = LogSrvc.logs;
	
}]);
;angular.module('OEPlayer')
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
                $location.search('hash', null);
                $location.path( '/player' );
            } else {
                $scope.message = data.error;
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
;/*jshint -W083 */
angular.module('OEPlayer')
.controller('OverlayCtrl',['$scope','$rootScope','OverlaySrvc','$element',function($scope,$rootScope,OverlaySrvc,$element){
	
	var unbindOpen = $rootScope.$on('open-overlay',function(){
		$scope.overlayTemplate = null;
		$scope.overlayTemplate = 'overlay-'+OverlaySrvc.type+'.html';
		$element.addClass('active');
	});

	var unbindClose = $rootScope.$on('close-overlay',function(){
		$scope.overlayTemplate = null;
		$element.removeClass('active');
	});

	$scope.closeOverlay = function(){
		$scope.overlayTemplate = null;
		$element.removeClass('active');
		$rootScope.$emit('close-overlay');
	};

	$scope.$on('$destroy', unbindOpen);
	$scope.$on('$destroy', unbindClose);

}])
.controller('OverlayQueueCtrl',['OverlaySrvc','$scope',function(OverlaySrvc,$scope){

    $scope.tracks = OverlaySrvc.data;

}])
.controller('OverlayBlockedCtrl',['FileFactory','$scope','config',function(FileFactory,$scope,config){

    FileFactory.readJSON(config.local_path,'blocked.json')
        .then(function(data){
            $scope.tracks = JSON.parse(data);
        });

}])
.controller('OverlayScheduleCtrl',['$scope',function($scope){

    $scope.selectedView = {
    	name:'template',
    	url:'schedule-template.html'
    };

    $scope.selectView = function(name,url){
    	$scope.selectedView = {
    		name:name,
    		url:url
    	};
    };
}])
.controller('OverlaySettingsCtrl',['$scope','SettingsSrvc','FileFactory','LogSrvc','config',function($scope,SettingsSrvc,FileFactory,LogSrvc,config){

    $scope.settings = {};
    $scope.settings.crossfadeIn = SettingsSrvc.crossfadeIn/100;
    $scope.settings.crossfadeOut = SettingsSrvc.crossfadeOut/100;
    $scope.settings.skipCrossfadeOut = SettingsSrvc.skipCrossfadeOut/100;
    $scope.settings.onlineCheck = SettingsSrvc.onlineCheck;
    $scope.settings.animations = SettingsSrvc.animations;
    $scope.settings.pushToPlayTime = SettingsSrvc.pushToPlayTime;
    $scope.settings.minEnergyPlaylist = SettingsSrvc.minEnergyPlaylist;
    $scope.settings.languages = SettingsSrvc.lang;

    $scope.cfTimes = [2,3,4,5,6,7,8,9,10];
    $scope.pushPlayLengths = [1,2,3];
    $scope.onlineCheck = [
        {type:1,name:'Standard'},
        {type:2,name:'Alternative'}
    ];
    $scope.minEnergyPlaylist = [30,40,50,60,70,80,90];
    $scope.languages = ['English','Spanish','Portuguese'];
    $scope.version = config.version;

    $scope.changeSetting = function(setting){
        if(setting == 'crossfadeIn' || setting == 'crossfadeOut' || setting == 'skipCrossfadeOut'){
            SettingsSrvc.setSetting(setting,$scope.settings[setting]*100);
        } else if(setting == 'languages'){
            var c = confirm($scope.lang.settings.changeLang);
            if(c){
                SettingsSrvc.setSetting(setting,$scope.settings[setting]);
                location.reload();
            }
        } else {
            SettingsSrvc.setSetting(setting,$scope.settings[setting]);
        }
    };

    $scope.deleteLibrary = function(){
        var c = confirm($scope.lang.settings.conflibdel);
        if(c){
            FileFactory.readDirectory('')
                .then(function(data){
                    for (var i = data.length - 1; i >= 0; i--) {
                        FileFactory.deleteFile('',data[i].name)
                            .then(function(res){
                                LogSrvc.logSystem(res);
                            });
                    }
                    window.location.reload();
                });
        }
    };
    $scope.deleteJson = function(){
        var c = confirm($scope.lang.settings.confstored);
        if(c){
            FileFactory.readDirectory('')
                .then(function(data){
                    for (var i = data.length - 1; i >= 0; i--) {
                        if(data[i].name.indexOf('.json') !== -1){
                            FileFactory.deleteFile('',data[i].name)
                                .then(function(res){
                                    LogSrvc.logSystem(res);
                                });
                        }
                    }
                    window.location.reload();
                });
        }
    };


}])
.controller('OverlayLibraryPlaylistsCtrl',['$scope','FileFactory','config','PlayerSrvc','$rootScope',function($scope,FileFactory,config,PlayerSrvc,$rootScope){

    $scope.init = function(){
        FileFactory.readJSON(config.local_path,'playlists.json')
            .then(function(data){
                $scope.venue = JSON.parse(data);
            });
    };
    $scope.init();

    $scope.playPlaylist = function(playlist){
        PlayerSrvc.pushToPlay(playlist);
        $scope.closeOverlay();
    };

}])
.controller('OverlayScheduleTemplateCtrl',['HTTPFactory','$scope','LogSrvc','FileFactory','config',function(HTTPFactory,$scope,LogSrvc,FileFactory,config){

	$scope.init = function(){

        $scope.schedules = [
            {day:$scope.lang.schedule.days.mon,schedule:[]},
            {day:$scope.lang.schedule.days.tue,schedule:[]},
            {day:$scope.lang.schedule.days.wed,schedule:[]},
            {day:$scope.lang.schedule.days.thur,schedule:[]},
            {day:$scope.lang.schedule.days.fri,schedule:[]},
            {day:$scope.lang.schedule.days.sat,schedule:[]},
            {day:$scope.lang.schedule.days.sun,schedule:[]}
        ];

        FileFactory.readJSON(config.local_path,'template.json')
            .then(function(data){
    	
                $scope.venue = JSON.parse( data );
                //loop schedules on venue object and insert into schedule scope
                angular.forEach($scope.venue.schedule_template,function(value){

                    var index;
                    //loop to get playlist - this is rubbish
                    angular.forEach($scope.venue.playlists,function(playlist,playlistIndex){
                        if(playlist.id == value.pivot.playlist_id){
                            index = playlistIndex;
                        }
                    });

                    var start = new Date('January 1, 2014 ' + value.pivot.start);
                    var end = new Date('January 1, 2014 ' + value.pivot.end);

                    var schedule = {
                        start:start,
                        end:end,
                        midnight_overlap:value.pivot.midnight_overlap,
                        id:value.pivot.id,
                        playlist:$scope.venue.playlists[index],
                    };
                    $scope.schedules[value.pivot.day].schedule.push(schedule);
            });
        });
    };

    $scope.init();

    $scope.calType = 1;

    $scope.checkMidnight = function(){
        var start = moment($scope.schedule.start);
        var end = moment($scope.schedule.end);
        //set midnight overlap
        //if set in fill gap, ignore
        if(typeof $scope.schedule.midnight_overlap === 'undefined'){
            if(end.hours() <= 4 && start.hours() <= 23 && start.hours() > 4){
                $scope.schedule.midnight_overlap = 1;
            } else {
                $scope.schedule.midnight_overlap = 0;
            }
        }
    };

    //create times
    $scope.times = [];
    var st = 4;
    var nd = 23;
    for (var i = st; i <= nd; i++) {
        $scope.times.push(i);
    }
    $scope.times.push('00');
    var stm = 1;
    var ndm = 4;
    for (var j = stm; j <= ndm; j++) {
        $scope.times.push(j);
    }

}])
.controller('OverlayScheduleCalendarCtrl',['HTTPFactory','$scope',function(HTTPFactory,$scope){

    //create times
    $scope.times = [];
    var st = 4;
    var nd = 23;
    for (var i = st; i <= nd; i++) {
        $scope.times.push(i);
    }
    $scope.times.push('00');
    var stm = 1;
    var ndm = 4;
    for (var j = stm; j <= ndm; j++) {
        $scope.times.push(j);
    }


    $scope.init = function(){
        //init schedules
        $scope.schedules = [
            {day:'Monday',schedule:[]},
            {day:'Tuesday',schedule:[]},
            {day:'Wednesday',schedule:[]},
            {day:'Thursday',schedule:[]},
            {day:'Friday',schedule:[]},
            {day:'Saturday',schedule:[]},
            {day:'Sunday',schedule:[]}
        ];
        //init template
        $scope.scheduleTemplate = [
            {day:'Monday',schedule:[]},
            {day:'Tuesday',schedule:[]},
            {day:'Wednesday',schedule:[]},
            {day:'Thursday',schedule:[]},
            {day:'Friday',schedule:[]},
            {day:'Saturday',schedule:[]},
            {day:'Sunday',schedule:[]}
        ];
        $scope.getHeaderDates();
        //get template
        HTTPFactory.getVenueCalendar($scope.weekStart.format('YYYY-MM-DD')).success(function(data){

            $scope.venue = data;
            //loop schedules on venue object and insert into schedule scope
            angular.forEach($scope.venue.schedule_template,function(value){

                var index;
                //loop to get playlist - this is rubbish
                angular.forEach($scope.venue.playlists,function(playlist,playlistIndex){
                    if(playlist.id == value.pivot.playlist_id){
                        index = playlistIndex;
                    }
                });

                var start = new Date('January 1, 2014 ' + value.pivot.start);
                var end = new Date('January 1, 2014 ' + value.pivot.end);

                var schedule = {
                    start:start,
                    end:end,
                    midnight_overlap:value.pivot.midnight_overlap,
                    id:value.pivot.id,
                    playlist:$scope.venue.playlists[index],
                };
                $scope.scheduleTemplate[value.pivot.day].schedule.push(schedule);
            });
            //loop calendar
            angular.forEach($scope.venue.schedule_calendar,function(value){

                var index;
                //loop to get playlist - this is rubbish
                angular.forEach($scope.venue.playlists,function(playlist,playlistIndex){
                    if(playlist.id == value.pivot.playlist_id){
                        index = playlistIndex;
                    }
                });

                var start = new Date('January 1, 2014 ' + value.pivot.start);
                var end = new Date('January 1, 2014 ' + value.pivot.end);

                var schedule = {
                    start:start,
                    end:end,
                    midnight_overlap:value.pivot.midnight_overlap,
                    id:value.pivot.id,
                    date:value.pivot.date,
                    playlist:$scope.venue.playlists[index],
                };
                $scope.schedules[value.pivot.day].schedule.push(schedule);
            });
        });
    };
    //set current date - use angular moment - http://momentjs.com/
    $scope.today = moment();
    $scope.weekStart = moment().startOf('isoWeek');

    $scope.getHeaderDates = function(change){
        var i = 1;
        angular.forEach($scope.schedules,function(value){
            value.date = moment($scope.weekStart).startOf('isoWeek').isoWeekday(i);
            //if today\
            value.active = false;
            if($scope.today.format('YYYY MM DD') == value.date.format('YYYY MM DD'))
                value.active = true;
            i++;
        });
    };
    $scope.getHeaderDates();

    $scope.calForward = function(){
        $scope.weekStart = moment($scope.weekStart).add(7,'days');
        $scope.getHeaderDates();
        $scope.init();
    };
    $scope.calBack = function(){
        $scope.weekStart = moment($scope.weekStart).add(-7,'days');
        $scope.getHeaderDates();
        $scope.init();
    };
    $scope.selectDate = function(){
        $scope.weekStart = moment($scope.datepicker).startOf('isoWeek');
        $scope.getHeaderDates();
        $scope.init();
    };

    $scope.checkMidnight = function(){
        var start = moment($scope.schedule.start);
        var end = moment($scope.schedule.end);
        //set midnight overlap
        //if set in fill gap, ignore
        if(typeof $scope.schedule.midnight_overlap === 'undefined'){
            if(end.hours() <= 4 && start.hours() <= 23 && start.hours() > 4){
                $scope.schedule.midnight_overlap = 1;
            } else {
                $scope.schedule.midnight_overlap = 0;
            }
        }
    };

    $scope.init();

}]);;/*jshint -W083 */
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
	$scope.initialising = false;

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
		$scope.energy = {
			status:false,
			level:5
		};
		$scope.player.online = $rootScope.online;

	    var mtStart = function(){
			var nowToday = new Date();
	    	var millisTillFourAM = new Date(nowToday.getFullYear(), nowToday.getMonth(), nowToday.getDate() + 1, 4, 0, 0, 0) - nowToday;
	    	if (millisTillFourAM < 0) {
	    	     millisTillFourAM += 86400000; // it's after midnight, try 10am tomorrow.
	    	}
		    var mtTimerStart = function(){
		    	var mtTimer = $timeout(function(){
		    		$timeout.cancel(mtTimer);
		    		mtTimer = undefined;
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
			//socket = new SocketFactory('ws://localhost:5000');
		}
		$scope.$on('socket:open',function(event,data){
			socket.send('playerInit',null);
		});
		$scope.$on('socket:closed',function(event,data){
			console.log('closed');
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
						}
						break;
					case 'skipBack':
						if(!$scope.swappingTracks){
							$scope.skipBack();
						}
						break;
					case 'playPause':
						if(!$scope.swappingTracks){
							$scope.playPause();
						}
						break;
					case 'restartPlayer':
						if(!$scope.swappingTracks){
							$scope.restart();
						}
						break;
					case 'pushToPlayID':
						if(!$scope.swappingTracks){
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
													socket.send('currentPlaylist',{name:$scope.playlist.name,ends:$scope.playlist.end});
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
				}
			} else {
				LogSrvc.logSystem('Not authenticated');
			}
		});
		
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
		});
	};

	var getPlaylistFromId = function(id){

		FileFactory.readJSON(config.local_path,'playlists.json')
			.then(function(data){
				var playlists = JSON.parse(data);
				for (var i = playlists.length - 1; i >= 0; i--) {
					console.log(playlists[i])
					if(playlists[i].id == id){
						return playlists[i];
					}
				}
			});
	}

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
					//getNextTrack(track);
				},function(error){
					LogSrvc.logError(error);
					window.location.reload();
				});
		}).error(function(err){
			LogSrvc.logError(err);
			window.location.reload();
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
				for (var i = blocked.length - 1; i >= 0; i--) {
					for (var j = playlist.tracks.length - 1; j >= 0; j--) {
						if(blocked[i].track_id == playlist.tracks[j].id){
							playlist.tracks.splice(j,1);
						}
					}
				}
			});
	}

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
								socket.send('currentPlaylist',{name:$scope.playlist.name,ends:$scope.playlist.end});
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

	var prepareNextTrack = function(lastPlayer){
		$scope.currentTrack.playerName = getNextPlayerName(lastPlayer);
		//now check if current playlist valid
		if(checkPlaylistStart($scope.playlist) || $scope.pushToPlay.status || $scope.energy.status){
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
									LogSrvc.logSystem('next track playback error');
									$interval.cancel(player[playerName].timer);
									player[playerName].timer = undefined;
									prepareNextTrack(playerName);
								} else {
									LogSrvc.logSystem('track playing');
								}
								$timeout.cancel(checkTimeout);
							};
							checkPlaying();
						},10000);
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
			init();
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
				$scope.player.currentIndex = 0;
				prepareNextTrack($scope.currentTrack.playerName);
				startPtpTimer();
			});//hours to milliseconds, cancel push to play
	});
	var startPtpTimer = function(){
		var time = SettingsSrvc.pushToPlayTime*3600000;
		//set timeout for push to play
		var startTimer = function(){
			var pushToPlayTimer = $timeout(function(){
				$scope.pushToPlay.status = false;
				$timeout.cancel(pushToPlayTimer);
				pushToPlayTimer = undefined;
				LogSrvc.logSystem('push-to-play timer end');
			},time);
		};
		startTimer();
	};
	$scope.$on('$destroy', unbindPushToPlay);

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
;angular.module('OEPlayer')
.directive('scheduleBox',['HTTPFactory','$document',function(HTTPFactory,$document){

    return{
        restrict:'E',
        scope:{
            schedule:'=schedule',
            dayIndex:'=',
            index:'=',
            type:'='
        },
        replace:true,
        templateUrl:'schedule-box.html',
        controller: function($scope){
            
            $scope.activateBox = function(){
                var active = angular.element(document.querySelectorAll('.schedule-box.active'));
                if(active.length === 0 && !$scope.active){
                    //for cancelled
                    $scope.saved = {};
                    $scope.saved.height = angular.copy($scope.height);
                    $scope.saved.offset = angular.copy($scope.offset);
                    //break data bind
                    $scope.saved.schedule = angular.copy($scope.schedule);
                    $scope.active = true;

                } else if(!$scope.active) {
                    //alert('Please cancel editing current schedule to edit another.');
                    active.isolateScope().saveOrCancel();
                    //for cancelled
                    $scope.saved = {};
                    $scope.saved.height = $scope.height;
                    $scope.saved.offset = $scope.offset;
                    //break data bind
                    $scope.saved.schedule = angular.copy($scope.schedule);
                    $scope.active = true;
                    
                }
            };

            $scope.moveMinutes = function(minutes) {
                $scope.schedule.start = new Date($scope.schedule.start.getTime() + minutes*60000);
                //double for 30px an hour
                $scope.schedule.end = new Date($scope.schedule.start.getTime() + parseInt($scope.height)*120000);
            };
            $scope.addMinutes = function(minutes){
                $scope.schedule.end = new Date($scope.schedule.start.getTime() + parseInt($scope.height)*120000);
            };

            $scope.checkMidnight = function(){
                var start = moment($scope.schedule.start);
                var end = moment($scope.schedule.end);
                //set midnight overlap
                if(end.hours() <= 4 && start.hours() <= 23 && start.hours() > 4){
                    $scope.schedule.midnight_overlap = 1;
                } else {
                    $scope.schedule.midnight_overlap = 0;
                }
            };
            $scope.saveSchedule = function(){

                $scope.checkMidnight();
                
                if($scope.type == 'template'){
                    HTTPFactory.updateTemplate($scope.schedule).success(function(data){
                        if(!data.error){
                            $scope.active = false;
                        }else{
                            alert(data.error);
                        }
                    });
                } else {
                    HTTPFactory.updateCalendar($scope.schedule).success(function(data){
                        if(!data.error){
                            $scope.active = false;
                        }else{
                            alert(data.error);
                        }
                    });
                }
            };
            $scope.deleteTemplate = function(elem){
                if($scope.type == 'template'){
                    HTTPFactory.deleteTemplate($scope.schedule.id).success(function(data){
                        if(!data.error){
                            elem.remove();
                            var index = $scope.$parent.schedules[$scope.dayIndex].schedule.indexOf($scope.schedule);
                            $scope.$parent.schedules[$scope.dayIndex].schedule.splice(index,1);
                        }else{
                            alert(data.error);
                        }
                    });
                } else {
                    HTTPFactory.deleteCalendar($scope.schedule.id).success(function(data){
                        if(!data.error){
                            elem.remove();
                            var index = $scope.$parent.schedules[$scope.dayIndex].schedule.indexOf($scope.schedule);
                            $scope.$parent.schedules[$scope.dayIndex].schedule.splice(index,1);
                        }else{
                            alert(data.error);
                        }
                    });
                }
            };

            $scope.saveOrCancel = function(){

                if($scope.height == $scope.saved.height && $scope.offset == $scope.saved.offset){
                    $scope.active = false;
                } else {
                    var r = confirm("Do you want to save or cancel current editing?");
                    if(r){
                        $scope.schedule.day = $scope.dayIndex;
                        $scope.saveSchedule();
                        $scope.active = false;
                    } else {
                        $scope.height = $scope.saved.height;
                        $scope.offset = $scope.saved.offset;
                        $scope.schedule = $scope.saved.schedule;
                        $scope.active = false;
                    }
                }

            };

        },
        link: function(scope, elem, attrs) {

            //if box is on sunday, add class for controls
            if(scope.dayIndex == 6){
                elem.addClass('controls-left');
            }
            //can't handle 1/2 hour playlists
            var diff = scope.schedule.end - scope.schedule.start;
            var oneHour = 1000*60*60;
            var diffHours = diff/oneHour;
            
            //if midnight overlap
            if(scope.schedule.midnight_overlap == 1){
                var toMidnight = 24 - scope.schedule.start.getHours();
                scope.height = ((toMidnight + parseInt(scope.schedule.end.getHours())) * 60 + parseInt(scope.schedule.end.getMinutes()))/2;
            } else {
                scope.height = (diffHours.toFixed(2) * 30);
                scope.height +=1;
            }
            //offset in minutes - 30px = 1 hour
            scope.offset = ((parseInt(scope.schedule.start.getHours()) * 60) + parseInt(scope.schedule.start.getMinutes()))/2;
            //if time is midnight to 3am
            if(scope.schedule.start.getHours() >= 0 && scope.schedule.start.getHours() < 4){
                scope.offset += 20*30;
                scope.offset += 30*4;
            }
            //offset for 4am start
            scope.offset = scope.offset - (30*4);

            //display time
            scope.duration = (scope.height/30);
            //control functions
            scope.moveUp = function(event){
                event.stopPropagation();
                if(scope.offset > 0){
                    scope.offset -= 15;
                    //why am i doing this?
                    scope.moveMinutes(-30);
                }
            };
            scope.moveDown = function(event){
                event.stopPropagation();
                if(scope.height + scope.offset < 720){
                    scope.offset += 15;               
                    scope.moveMinutes(30); 
                }
            };

            scope.delete = function(event){
                event.stopPropagation();
                scope.deleteTemplate(elem);
            };
            scope.cancel = function(event){
                event.stopPropagation();
                scope.height = scope.saved.height;
                scope.offset = scope.saved.offset;
                scope.schedule = scope.saved.schedule;
                scope.active = false;
            };

            scope.save = function(event){
                event.stopPropagation();
                scope.schedule.day = scope.dayIndex;
                scope.saveSchedule();
                
            };

            scope.increaseLength = function(event){
                event.stopPropagation();
                if(scope.height + scope.offset < 720){
                    scope.height += 15;
                    scope.duration += 0.5;
                    scope.addMinutes(30);
                }
            };

            scope.decreaseLength = function(event){
                event.stopPropagation();
                if(scope.height > 15){
                    scope.height -= 15;
                    scope.duration -= 0.5;
                    scope.addMinutes(-30); 
                }
            };

            //draggable
            var startY;
            var elHeight;

            /*elem.on('mousedown', function(event) {

                event.preventDefault();
                if(scope.active){
                    startY = elem.css('top');

                    $document.on('mousemove', mousemove);
                    $document.on('mouseup', mouseup);
                }

            });

            function moveSchedule(event,direction){

                if(direction == 'up'){
                    var y = parseInt(startY) - 15;
                    if(y > -1)
                        scope.moveMinutes(-30);
                } else {
                    var y = parseInt(startY) + 15;
                    scope.moveMinutes(30); 
                }

                if(y > -1 ){        
                    elem.css({top: y + 'px'});
                    scope.offset = y;
                    startY = elem.css('top');
                }
            }
            var moves = 0;
            var direction = 0;
            function mousemove(event) {

                moves++;
                if(event.pageY%7 == 0){

                    if(event.pageY < direction){
                        moveSchedule(event,'up');
                    } else if(direction != 0){
                        moveSchedule(event,'down')
                    }
                    direction = event.pageY;
                }
            }

            function mouseup() {
                $document.off('mousemove', mousemove);
                $document.off('mouseup', mouseup);
            }*/


        }
    };

}])
.directive('scheduleBoxInactive',[function(){

    return{
        restrict:'E',
        scope:{
            schedule:'=schedule',
            dayIndex:'=',
            index:'='
        },
        replace:true,
        templateUrl:'schedule-box-inactive.html',
        link: function(scope, elem, attrs) {

            //can't handle 1/2 hour playlists
            var diff = scope.schedule.end - scope.schedule.start;
            var oneHour = 1000*60*60;
            var diffHours = diff/oneHour;
            
            //if midnight overlap
            if(scope.schedule.midnight_overlap == 1){
                var toMidnight = 24 - scope.schedule.start.getHours();
                scope.height = ((toMidnight + parseInt(scope.schedule.end.getHours())) * 60 + parseInt(scope.schedule.end.getMinutes()))/2;
            } else {
                scope.height = (diffHours.toFixed(2) * 30);
                scope.height +=1;
            }
            //offset in minutes - 30px = 1 hour
            scope.offset = ((parseInt(scope.schedule.start.getHours()) * 60) + parseInt(scope.schedule.start.getMinutes()))/2;
            //if time is midnight to 3am
            if(scope.schedule.start.getHours() >= 0 && scope.schedule.start.getHours() < 4){
                scope.offset += 20*30;
                scope.offset += 30*4;
            }
            //offset for 4am start
            scope.offset = scope.offset - (30*4);

            //display time
            scope.duration = (scope.height/30);

        }
    };

}])
.filter('makeTime', [function () {
    return function (item) {
        return item + '.00';
    };
}]);;angular.module('OEPlayer')
.factory('FileFactory',['FileSystem','$q',function(FileSystem,$q){

	return {
		init:function(){
			var deferred = $q.defer();
			FileSystem.init()
				.then(function(result){
					deferred.resolve(result);
				},function(error){
					deferred.reject(error);
				});
			return deferred.promise;
		},
		writeTrack: function(dir,filename,data,blnReplace){
			var deferred = $q.defer();
			var blob = new Blob([data], {type: 'audio/mpeg'});
			FileSystem.writeFile(dir,filename.toString(),blob,blnReplace)
				.then(function(result){
					deferred.resolve(result);
				},function(error){
					deferred.reject(error);
				});
			return deferred.promise;
		},
		writeJSON: function(dir,filename,data,blnReplace){
			var deferred = $q.defer();
			var json = JSON.stringify(data);
			var blob = new Blob([json], {type: 'text/plain'});
			FileSystem.writeFile(dir,filename.toString(),blob,blnReplace)
				.then(function(result){
					deferred.resolve(result);
				},function(error){
					deferred.reject(error);
				});
			return deferred.promise;
		},
		readJSON:function(dir,filename){
			var deferred = $q.defer();
			FileSystem.readAsText(dir,filename)
				.then(function(result){
					deferred.resolve(result);
				},function(error){
					deferred.reject(error);
				});
			return deferred.promise;
		},
		checkFile: function(dir,filename){
			var deferred = $q.defer();
			FileSystem.checkFile(dir,filename.toString())
				.then(function(result){
					deferred.resolve(result);
				},function(error){
					deferred.reject(error);
				});
			return deferred.promise;
		},
		readTrack: function(dir,filename){
			var deferred = $q.defer();
			FileSystem.readAsArrayBuffer(dir,filename.toString())
				.then(function(result){
					var blob = new Blob([(result)], {type: 'audio/mpeg'});
					deferred.resolve(blob);
				},function(error){
					deferred.reject(error);
				});
			return deferred.promise;
		},
		readDirectory: function(dir){
			var deferred = $q.defer();
			FileSystem.readDirectory(dir)
				.then(function(results){
					deferred.resolve(results);
				},function(error){
					deferred.reject(error);
				});
			return deferred.promise;
		},
		deleteFile:function(path,file){
			var deferred = $q.defer();
			FileSystem.deleteFile(path,file)
				.then(function(results){
					deferred.resolve(results);
				},function(error){
					deferred.reject(error);
				});
			return deferred.promise;	
		},
		getMetadata:function(path,file){
			var deferred = $q.defer();
			FileSystem.getMetadata(path,file)
				.then(function(results){
					deferred.resolve(results);
				},function(error){
					deferred.reject(error);
				});
			return deferred.promise;	
		}
	};
}]);;angular.module('OEPlayer')
.factory('HTTPFactory',['$http','config','$q',function($http,config,$q){
	
	return {
		login:function(data){
			return $http.post(config.api_url+'login',data);
		},
        loginHash:function(data){
            return $http.post(config.api_url+'login-hash',data);
        },
		getPlaylists:function(){
			return $http.get(config.api_url+'playlists');
		},
		getTracks:function(){
			return $http.get(config.api_url+'tracks');
		},
		getSchedule:function(){
			return $http.get(config.api_url+'schedule');
		},
		logTrack:function(logs){
			return $http.post(config.log_path,logs);
		},
		blockTrack:function(id){
			return $http.put(config.api_url+'block-track/'+id);
		},
		getBlocked:function(){
			return $http.get(config.api_url+'blocked-tracks');
		},
		getTrackFile:function(src){
            return $http({
                type:'GET',
                url:src,
                responseType: "arraybuffer",
                headers:{'Authentication':undefined}
            });
        },
        getScheduleTemplate:function(){
        	return $http.get(config.api_url+'schedule-template');
        },
        getVenueCalendar:function(date){
        	return $http.get(config.api_url+'schedule-calendar/'+date);
        },
        checkOnline:function(){
        	return $http.head(config.api_url+'playlists');
        },
        reprocessFile:function(track){
        	return $http.post(config.api_url+'reprocess-file',track);
        }
	};
}])
.factory("HttpErrorInterceptorModule", ['$q', '$location','$rootScope',function($q,$location,$rootScope){
	return {
        'responseError': function(rejection) {
            // do something on error
            if(rejection.status === 401){
            	$rootScope.$emit('global-pause');
                $location.path('/login');
            }
            return $q.reject(rejection);
         }
     };
}]);
;angular.module('OEPlayer')
.factory('LangFactory',['SettingsSrvc',function(SettingsSrvc){
	var dictionary = {
		English:{
			menu:{
				playlists:'push to play',
				queue:'queue',
				schedule:'schedule',
				settings:'settings',
				restart:'restart',
				logout:'logout',
				conflogout:'Are you sure you want to logoff?'
			},
			player:{
				online:'online',
				offline:'offline',
				lastplayed:{
					title:'Last Played',
					table:{
						title:'Title',
						album:'Album',
						artist:'Artist',
						block:'Block',
						played:'Played at'
					}
				}

			},
			playlists:{
				title:'Push to Play',
				table:{
					title:'Title',
					album:'Album',
					artist:'Artist',
					block:'Block'
				}
			},
			queue:{
				title:'Queue',
				table:{
					title:'Title',
					album:'Album',
					artist:'Artist',
					block:'Block',
					energy:'Energy'
				}
			},
			schedule:{
				title:'Schedule',
				sub:{
					template:'Week Template',
					cal:'Calendar'
				},
				days:{
					mon:'Monday',
					tues:'Tuesday',
					wed:'Wednesday',
					thurs:'Thursday',
					fri:'Friday',
					sat:'Saturday',
					sun:'Sunday'
				}
			},
			settings:{
				title:'Settings',
				language:'Language',
				fadein:'Fade in time (seconds)',
				fadeout:'Fade out time (seconds)',
				skip:'Skip fade out time (seconds)',
				online:'Online check type',
				animations:'Animations',
				pushtoplay:'Push to play time (hours)',
				energy:'Energy slider minimum playlist length',
				delstored:'Delete Stored Data',
				dellib:'Delete Library',
				conflibdel:'Are you sure you want to delete the library?',
				confstored:'Are you sure you want to delete stored data?',
				changeLang:'Changing language will require a restart. Are you sure?'
			}
		},
		Portuguese:{
			menu:{
				playlists:'playlists',
				queue:'fila',
				schedule:'cronograma',
				settings:'configurações',
				restart:'reiniciar',
				logout:'sair',
				conflogout:'Tem certeza de que quer sair do site ?'
			},
			player:{
				online:'conectados',
				offline:'off-line',
				lastplayed:{
					title:'Tocada por último',
					table:{
						title:'Título',
						album:'Álbum',
						artist:'Artista',
						block:'Bloquear',
						played:'Tocado em'
					}
				}

			},
			playlists:{
				title:'Playlists',
				table:{
					title:'Título',
					album:'Álbum',
					artist:'Artista',
					block:'Bloquear',
				}
			},
			queue:{
				title:'Fila',
				table:{
					title:'Título',
					album:'Álbum',
					artist:'Artista',
					block:'Bloquear',
					energy:'Energia'
				}
			},
			schedule:{
				title:'Cronograma',
				sub:{
					template:'Modelo Semanal',
					cal:'Calendário'
				},
				days:{
					mon:'Segunda',
					tues:'Terça',
					wed:'Quarta',
					thurs:'Quinta',
					fri:'Sexta',
					sat:'Sabádo',
					sun:'Domingo'
				}
			},
			settings:{
				title:'Configurações',
				language:'Idioma',
				fadein:'Fade in (segundos)',
				fadeout:'Fade out (segundos)',
				skip:'Skip fade out tempo (segundos)',
				online:'Tipo de verificação on-line',
				animations:'Animações',
				pushtoplay:'Começa a tocar as (horas)',
				energy:'Tamanho mínimo da playlists do Slider de Energia',
				delstored:'Excluir os dados armazenados',
				dellib:'excluir Biblioteca',
				conflibdel:'Tem certeza de que deseja excluir a biblioteca ?',
				confstored:'Tem certeza de que quer apagar os dados armazenados ?',
				changeLang:'Changing language will require a restart. Are you sure?'
			}
		},
		Spanish:{
			menu:{
				playlists:'listas de reproducción',
				queue:'en espera',
				schedule:'horario',
				settings:'preferencias',
				restart:'reiniciar',
				logout:'cerrar sesión',
				conflogout:'¿Está seguro desea cerrar su sesión?'
			},
			player:{
				online:'en línea',
				offline:'sin conexión',
				lastplayed:{
					title:'Ultima Reproducción',
					table:{
						title:'Título',
						album:'Album',
						artist:'Artista',
						block:'Bloquear',
						played:'Reproducida a las'
					}
				}

			},
			playlists:{
				title:'Listas de reproducción',
				table:{
					title:'Título',
					album:'Album',
					artist:'Artista',
					block:'Bloquear',
				}
			},
			queue:{
				title:'En espera',
				table:{
					title:'Título',
					album:'Album',
					artist:'Artista',
					block:'Bloquear',
					energy:'Energía'
				}
			},
			schedule:{
				title:'Horario',
				sub:{
					template:'Plantilla Semanal',
					cal:'Calendario'
				},
				days:{
					mon:'Lunes',
					tues:'Martes',
					wed:'Miércoles',
					thurs:'Jueves',
					fri:'Viernes',
					sat:'Sábado',
					sun:'Domingo'
				}
			},
			settings:{
				title:'Preferencias',
				language:'Idioma',
				fadein:'Tiempo de inicio gradual (segundos)',
				fadeout:'Tiempo de terminación gradual (segundos)',
				skip:'Saltar tiempo de terminación gradual (segundos)',
				online:'Checar tipo en línea',
				animations:'Animaciones',
				pushtoplay:'Oprimir para tiempo de reproducción (horas)',
				energy:'Energy slider minimum playlist length',
				delstored:'Borrar Datos Almacenados',
				dellib:'Borrar Biblioteca',
				conflibdel:'¿Está usted seguro que desea borrar la biblioteca?',
				confstored:'¿Está usted seguro que desea borrar los datos almacenados?',
				changeLang:'Cambiar idioma requerirá reinicio. ¿Está seguro?'
			}
		}
	};

	return dictionary[SettingsSrvc.lang];
}]);;angular.module('OEPlayer')
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
		isPlaying:function(playerName){
			return !self[self.playerName].createdMedia.paused;
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
}]);;angular.module('OEPlayer')
.factory('SocketFactory',['$rootScope','$interval','LogSrvc',function($rootScope,$interval,LogSrvc){

    var socket;
    var self = this;

    var SocketFactory = function(url){
        self.socket = new WebSocket(url);
        self.socket.onopen = angular.bind(this,this.open);
        self.socket.onclose = angular.bind(this,this.close);
        self.socket.onmessage = angular.bind(this,this.receive);
        self.socket.onerror = angular.bind(this,this.error);
    };

    SocketFactory.prototype = {
        open:function(){
            var data = {token:localStorage.getItem('Authentication'),event:'ping'};
            var ping = $interval(function(){
                var pingStart = function(){
                    self.socket.send(JSON.stringify(data));
                };
                pingStart();
            },10000);
            $rootScope.$broadcast('socket:open');
        },
        close:function(){
            $rootScope.$broadcast('socket:closed');
        },
        receive:function(data){
            $rootScope.$broadcast('socket:message',JSON.parse(data.data));
        },
        send:function(event,dt){
            var data = {
                token:localStorage.getItem('Authentication'),
                event:event,
                data:dt
            };
            self.socket.send(JSON.stringify(data));
        },
        error:function(err){
            LogSrvc.logError(err);
        },
        endConnection:function(){
            self.socket.close();
        }

    };

    return SocketFactory;
}])
.service("guid", function () {
    var guid = (function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                       .toString(16)
                       .substring(1);
        }
        return function () {
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                   s4() + '-' + s4() + s4() + s4();
        };
    })();
    return guid;
});
;// Check if a new cache is available on page load.
/*window.addEventListener('load', function(e) {

  window.applicationCache.addEventListener('updateready', function(e) {
    if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
      // Browser downloaded a new app cache.
      window.location.reload();
    } else {
      // Manifest didn't changed. Nothing new to server.
    }
  }, false);

}, false);*/
document.addEventListener('DOMContentLoaded', function onDeviceReady() {
	var el = document.querySelector('html');
    angular.bootstrap(el, ['OEPlayer']);
}, false);;angular.module('OEPlayer')
.constant('cordovaFileError', {
    1: 'NOT_FOUND_ERR',
    2: 'SECURITY_ERR',
    3: 'ABORT_ERR',
    4: 'NOT_READABLE_ERR',
    5: 'ENCODING_ERR',
    6: 'NO_MODIFICATION_ALLOWED_ERR',
    7: 'INVALID_STATE_ERR',
    8: 'SYNTAX_ERR',
    9: 'INVALID_MODIFICATION_ERR',
    10: 'QUOTA_EXCEEDED_ERR',
    11: 'TYPE_MISMATCH_ERR',
    12: 'PATH_EXISTS_ERR'
})
.factory('FileSystem',['LogSrvc','$q','$window','config','cordovaFileError',function(LogSrvc,$q,$window,config,cordovaFileError){

    var oefs = {
        fs:{},
        c:0
    };

    return {

        init: function(){
            LogSrvc.logSystem('Starting file system');
            var q = $q.defer();
            navigator.webkitPersistentStorage.requestQuota(
                10*1024*1024*1024,
                function( grantedBytes ) {
                    this.availableSpace = grantedBytes;
                    window.webkitRequestFileSystem(
                        window.PERSISTENT, 
                        grantedBytes,
                        function(fs){
                            oefs.fs = fs;
                            q.resolve('File system ready');
                        },
                        function(error){
                            LogSrvc.logError(error);
                            q.reject(error);
                        }
                    );
                },
                function(error){
                    LogSrvc.logError(error);
                    q.reject(error);
                }
            );
            return q.promise;
        },
        checkDir: function (path, dir) {
            oefs.c++;
            var q = $q.defer();

            if ((/^\//.test(dir))) {
                q.reject('directory cannot start with \/');
            }

            try {
                var directory = path + dir;
                $window.resolveLocalFileSystemURL(directory, function (fileSystem) {
                    if (oefs.fs.root.isDirectory === true) {
                        q.resolve(fileSystem);
                    } else {
                        q.reject({code: 13, message: 'input is not a directory'});
                    }
                }, function (error) {
                    error.message = cordovaFileError[error.code];
                    q.reject(error);
                });
            } catch (err) {
                err.message = cordovaFileError[err.code];
                q.reject(err);
            }

            return q.promise;
        },
        checkFile: function (path, file) {
            oefs.c++;
            var q = $q.defer();

            if ((/^\//.test(file))) {
                q.reject('directory cannot start with \/');
            }

            try {
                var directory = path + file;
                oefs.fs.root.getFile(directory, {create:false},function() {
                    q.resolve(true);
                }, function () {
                    q.reject(false);
                });
            } catch (err) {
                err.message = cordovaFileError[err.code];
                q.reject(err);
            }

            return q.promise;
        },
        createDir: function (path, dirName, replaceBool) {
            oefs.c++;
            var q = $q.defer();

            if ((/^\//.test(dirName))) {
                q.reject('directory cannot start with \/');
            }

            replaceBool = replaceBool ? false : true;

            var options = {
                create: true,
                exclusive: replaceBool
            };

            try {
                oefs.fs.root.getDirectory(dirName, options, function (result) {
                    q.resolve(result);
                }, function (error) {
                    error.message = cordovaFileError[error.code];
                    q.reject(error);
                });
            } catch (e) {
                e.message = cordovaFileError[e.code];
                q.reject(e);
            }

            return q.promise;
        },
        createFile: function (path, fileName, replaceBool) {
            oefs.c++;
            var q = $q.defer();

            if ((/^\//.test(fileName))) {
                q.reject('file-name cannot start with \/');
            }

            replaceBool = replaceBool ? false : true;

            var options = {
                create: true,
                exclusive: replaceBool
            };

            try {
                oefs.fs.root.getFile(fileName, options, function (result) {
                    q.resolve(result);
                }, function (error) {
                    error.message = cordovaFileError[error.code];
                    q.reject(error);
                });
            } catch (e) {
                e.message = cordovaFileError[e.code];
                q.reject(e);
            }
            return q.promise;
        },
        removeDir: function (path, dirName) {
            oefs.c++;
            var q = $q.defer();

            if ((/^\//.test(dirName))) {
                q.reject('file-name cannot start with \/');
            }

            try {
                oefs.fs.root.getDirectory(dirName, {create: false}, function (dirEntry) {
                    dirEntry.remove(function () {
                    q.resolve({success: true, fileRemoved: dirEntry});
                }, function (error) {
                    error.message = cordovaFileError[error.code];
                    q.reject(error);
                });
                }, function (err) {
                    err.message = cordovaFileError[err.code];
                    q.reject(err);
                });
            } catch (e) {
                e.message = cordovaFileError[e.code];
                q.reject(e);
            }
            return q.promise;
        },
        removeFile: function (path, fileName) {
            oefs.c++;
            var q = $q.defer();

            if ((/^\//.test(fileName))) {
                q.reject('file-name cannot start with \/');
            }

            try {
                oefs.fs.root.getFile(fileName, {create: false}, function (fileEntry) {
                    fileEntry.remove(function () {
                        q.resolve({success: true, fileRemoved: fileEntry});
                    }, function (error) {
                        error.message = cordovaFileError[error.code];
                        q.reject(error);
                    });
                }, function (err) {
                    err.message = cordovaFileError[err.code];
                    q.reject(err);
                });
            } catch (e) {
                e.message = cordovaFileError[e.code];
                q.reject(e);
            }
            return q.promise;
        },
        removeRecursively: function (path, dirName) {
            oefs.c++;
          var q = $q.defer();

          if ((/^\//.test(dirName))) {
            q.reject('file-name cannot start with \/');
          }

          try {
                oefs.fs.root.getDirectory(dirName, {create: false}, function (dirEntry) {
                    dirEntry.removeRecursively(function () {
                        q.resolve({success: true, fileRemoved: dirEntry});
                    }, function (error) {
                        error.message = cordovaFileError[error.code];
                        q.reject(error);
                    });
                }, function (err) {
                    err.message = cordovaFileError[err.code];
                    q.reject(err);
                });
            } catch (e) {
                e.message = cordovaFileError[e.code];
                q.reject(e);
            }
            return q.promise;
        },
        writeFile: function (path, fileName, text, replaceBool) {
            oefs.c++;
            var q = $q.defer();

            if ((/^\//.test(fileName))) {
                q.reject('file-name cannot start with \/');
            }

            replaceBool = replaceBool ? false : true;

            var options = {
                create: true,
                exclusive: replaceBool
            };

            try {
                oefs.fs.root.getFile(fileName, options, function (fileEntry) {
                    fileEntry.createWriter(function (writer) {
                        if (options.append === true) {
                            writer.seek(writer.length);
                        }

                        if (options.truncate) {
                            writer.truncate(options.truncate);
                        }

                        writer.onwriteend = function (evt) {
                            if (this.error) {
                                q.reject(this.error);
                                LogSrvc.logError(this.error);
                            } else {
                                q.resolve(evt);
                            }
                        };

                        writer.write(text);

                        q.promise.abort = function () {
                            writer.abort();
                        };
                    });
                }, function (error) {
                    error.message = cordovaFileError[error.code];
                    q.reject(error);
                });
            } catch (e) {
                e.message = cordovaFileError[e.code];
                q.reject(e);
            }

            return q.promise;
        },
        writeExistingFile: function (path, fileName, text) {
            oefs.c++;
            var q = $q.defer();

            if ((/^\//.test(fileName))) {
                q.reject('file-name cannot start with \/');
            }

            try {

                oefs.fs.root.getFile(fileName, {create: false}, function (fileEntry) {
                    fileEntry.createWriter(function (writer) {
                        writer.seek(writer.length);

                        writer.onwriteend = function (evt) {
                            if (this.error) {
                                q.reject(this.error);
                            } else {
                                q.resolve(evt);
                            }
                        };

                        writer.write(text);

                        q.promise.abort = function () {
                            writer.abort();
                        };
                    });
                }, function (err) {
                    err.message = cordovaFileError[err.code];
                    q.reject(err);
                });
            } catch (e) {
                e.message = cordovaFileError[e.code];
                q.reject(e);
            }

            return q.promise;
        },
        readAsText: function (path, file) {
            oefs.c++;
            var q = $q.defer();

            if ((/^\//.test(file))) {
                q.reject('file-name cannot start with \/');
            }

            try {
            
                oefs.fs.root.getFile(file, {create: false}, function (fileEntry) {
                    fileEntry.file(function (fileData) {
                        var reader = new FileReader();

                        reader.onloadend = function (evt) {
                            if (evt.target.result !== undefined || evt.target.result !== null) {
                                q.resolve(evt.target.result);
                            } else if (evt.target.error !== undefined || evt.target.error !== null) {
                                q.reject(evt.target.error);
                            } else {
                                q.reject({code: null, message: 'READER_ONLOADEND_ERR'});
                            }
                        };

                        reader.readAsText(fileData);
                    });
                }, function (error) {
                    LogSrvc.logError(error.message);
                    q.reject(error);
                });
            } catch (e) {
                e.message = cordovaFileError[e.code];
                q.reject(e);
            }

            return q.promise;
        },
        readAsDataURL: function (path, file) {
            oefs.c++;
          var q = $q.defer();

          if ((/^\//.test(file))) {
            q.reject('file-name cannot start with \/');
          }

            try {
            
                oefs.fs.root.getFile(file, {create: false}, function (fileEntry) {
                    fileEntry.file(function (fileData) {
                        var reader = new FileReader();
                        reader.onloadend = function (evt) {
                            if (evt.target.result !== undefined || evt.target.result !== null) {
                                q.resolve(evt.target.result);
                            } else if (evt.target.error !== undefined || evt.target.error !== null) {
                                q.reject(evt.target.error);
                            } else {
                                q.reject({code: null, message: 'READER_ONLOADEND_ERR'});
                            }
                        };
                        reader.readAsDataURL(fileData);
                    });
                }, function (error) {
                    error.message = cordovaFileError[error.code];
                    q.reject(error);
                });
            } catch (e) {
                e.message = cordovaFileError[e.code];
                q.reject(e);
            }

            return q.promise;
        },
        readAsBinaryString: function (path, file) {
            oefs.c++;
            var q = $q.defer();

            if ((/^\//.test(file))) {
                q.reject('file-name cannot start with \/');
            }

            try {
            
                oefs.fs.root.getFile(file, {create: false}, function (fileEntry) {
                    fileEntry.file(function (fileData) {
                        var reader = new FileReader();
                        reader.onloadend = function (evt) {
                            if (evt.target.result !== undefined || evt.target.result !== null) {
                                q.resolve(evt.target.result);
                            } else if (evt.target.error !== undefined || evt.target.error !== null) {
                                q.reject(evt.target.error);
                            } else {
                                q.reject({code: null, message: 'READER_ONLOADEND_ERR'});
                            }
                        };
                        reader.readAsBinaryString(fileData);
                    });
                }, function (error) {
                    error.message = cordovaFileError[error.code];
                    q.reject(error);
                });
            } catch (e) {
                e.message = cordovaFileError[e.code];
                q.reject(e);
            }

            return q.promise;
        },
        readAsArrayBuffer: function (path, file) {
            oefs.c++;
          var q = $q.defer();

          if ((/^\//.test(file))) {
            q.reject('file-name cannot start with \/');
          }

          try {
              oefs.fs.root.getFile(file, {create: false}, function (fileEntry) {
                fileEntry.file(function (fileData) {
                  var reader = new FileReader();
                  reader.onloadend = function (evt) {
                    if (evt.target.result !== undefined || evt.target.result !== null) {
                      q.resolve(evt.target.result);
                    } else if (evt.target.error !== undefined || evt.target.error !== null) {
                      q.reject(evt.target.error);
                    } else {
                      q.reject({code: null, message: 'READER_ONLOADEND_ERR'});
                    }
                  };
                  reader.readAsArrayBuffer(fileData);
                });
              }, function (error) {
                error.message = cordovaFileError[error.code];
                q.reject(error);
              });
          } catch (e) {
            e.message = cordovaFileError[e.code];
            q.reject(e);
          }

          return q.promise;
        },
        moveFile: function (path, fileName, newPath, newFileName) {
            oefs.c++;
          var q = $q.defer();

          newFileName = newFileName || fileName;

          if ((/^\//.test(fileName)) || (/^\//.test(newFileName))) {
            q.reject('file-name cannot start with \/');
          }

          try {

              oefs.fs.root.getFile(fileName, {create: false}, function (fileEntry) {
                $window.resolveLocalFileSystemURL(newPath, function (newFileEntry) {
                  fileEntry.moveTo(newFileEntry, newFileName, function (result) {
                    q.resolve(result);
                  }, function (error) {
                    q.reject(error);
                  });
                }, function (err) {
                  q.reject(err);
                });
              }, function (err) {
                q.reject(err);
              });
          } catch (e) {
            q.reject(e);
          }
          return q.promise;
        },
        moveDir: function (path, dirName, newPath, newDirName) {
            oefs.c++;
          var q = $q.defer();

          newDirName = newDirName || dirName;

          if (/^\//.test(dirName) || (/^\//.test(newDirName))) {
            q.reject('file-name cannot start with \/');
          }

          try {
            $window.resolveLocalFileSystemURL(path, function (fileSystem) {
              oefs.fs.root.getDirectory(dirName, {create: false}, function (dirEntry) {
                $window.resolveLocalFileSystemURL(newPath, function (newDirEntry) {
                  dirEntry.moveTo(newDirEntry, newDirName, function (result) {
                    q.resolve(result);
                  }, function (error) {
                    q.reject(error);
                  });
                }, function (erro) {
                  q.reject(erro);
                });
              }, function (err) {
                q.reject(err);
              });
            }, function (er) {
              q.reject(er);
            });
          } catch (e) {
            q.reject(e);
          }
          return q.promise;
        },
        copyDir: function (path, dirName, newPath, newDirName) {
            oefs.c++;
          var q = $q.defer();

          newDirName = newDirName || dirName;

          if (/^\//.test(dirName) || (/^\//.test(newDirName))) {
            q.reject('file-name cannot start with \/');
          }

          try {
            $window.resolveLocalFileSystemURL(path, function (fileSystem) {
              oefs.fs.root.getDirectory(dirName, {create: false, exclusive: false}, function (dirEntry) {

                $window.resolveLocalFileSystemURL(newPath, function (newDirEntry) {
                  dirEntry.copyTo(newDirEntry, newDirName, function (result) {
                    q.resolve(result);
                  }, function (error) {
                    error.message = cordovaFileError[error.code];
                    q.reject(error);
                  });
                }, function (erro) {
                  erro.message = cordovaFileError[erro.code];
                  q.reject(erro);
                });
              }, function (err) {
                err.message = cordovaFileError[err.code];
                q.reject(err);
              });
            }, function (er) {
              er.message = cordovaFileError[er.code];
              q.reject(er);
            });
          } catch (e) {
            e.message = cordovaFileError[e.code];
            q.reject(e);
          }
          return q.promise;
        },
        copyFile: function (path, fileName, newPath, newFileName) {
            oefs.c++;
          var q = $q.defer();

          newFileName = newFileName || fileName;

          if ((/^\//.test(fileName))) {
            q.reject('file-name cannot start with \/');
          }

          try {
            $window.resolveLocalFileSystemURL(path, function (fileSystem) {
              oefs.fs.root.getFile(fileName, {create: false, exclusive: false}, function (fileEntry) {

                $window.resolveLocalFileSystemURL(newPath, function (newFileEntry) {
                  fileEntry.copyTo(newFileEntry, newFileName, function (result) {
                    q.resolve(result);
                  }, function (error) {
                    error.message = cordovaFileError[error.code];
                    q.reject(error);
                  });
                }, function (erro) {
                  erro.message = cordovaFileError[erro.code];
                  q.reject(erro);
                });
              }, function (err) {
                err.message = cordovaFileError[err.code];
                q.reject(err);
              });
            }, function (er) {
              er.message = cordovaFileError[er.code];
              q.reject(er);
            });
          } catch (e) {
            e.message = cordovaFileError[e.code];
            q.reject(e);
          }
          return q.promise;
        },
        readDirectory:function(path){
            oefs.c++;
            var q = $q.defer();

            //if ((/^\//.test(path))) {
            //    q.reject('directory cannot start with \/');
            //}
            try {
                oefs.fs.root.getDirectory('/',{create:false,exclusive:false},function(dirEntry){
                    var dirReader = dirEntry.createReader();
                    var entries = [];
                    var readEntries = function(){
                        dirReader.readEntries(function (results) {
                            if (!results.length) {
                                q.resolve(entries);
                            } else {
                                entries = entries.concat(Array.prototype.slice.call(results || [], 0));
                                readEntries();
                            }
                        }, function (error) {
                            q.reject(cordovaFileError[error.code]);
                        });
                    };
                    readEntries();
                },function(error){
                  q.reject(cordovaFileError[error.code]);
                });
            } catch (e) {
                q.reject(cordovaFileError[e.code]);
            }

            return q.promise;
        },        
        deleteFile:function(path,file){
            oefs.c++;
            var q = $q.defer();
            if ((/^\//.test(file))) {
                q.reject('file-name cannot start with \/');
            }
            try {
                  oefs.fs.root.getFile( file , {create: false}, function(fileEntry) {
                      fileEntry.remove(function() {
                          LogSrvc.logSystem('file '+file+' deleted');
                          q.resolve('file '+file+' deleted');
                      });
                });
            } catch(e){
                q.reject(cordovaFileError[e.code]);
            }
            return q.promise;
        },
        getMetadata:function(path,file){
            oefs.c++;
            var q = $q.defer();
            if ((/^\//.test(file))) {
                q.reject('file-name cannot start with \/');
            }
            try {
                  oefs.fs.root.getFile( file , {}, function(fileEntry) {
                      fileEntry.getMetadata(function(metadata) {
                          q.resolve(metadata);
                      });
                });
            } catch(e){
                q.reject(cordovaFileError[e.code]);
            }
            return q.promise;
        }
    };
}]);;angular.module('OEPlayer')
.service('LogSrvc',['$rootScope','$q',function($rootScope,$q){
	
	var LogSrvc = {};
	
	LogSrvc.logs = [];
	LogSrvc.intLogs = [];
	var d, log;

	LogSrvc.logSystem = function(log){
		d = new Date();
		log = '[SYSTEM] '+log + ' ' + d.getHours() +':'+d.getMinutes()+':'+d.getSeconds();
		console.log(log);
		LogSrvc.intLogs.push(log);
		return $q.when(LogSrvc.intLogs).then(function(data) {
	        // this is the magic
        	angular.copy(data, LogSrvc.logs);
      	});
	};
	LogSrvc.logError = function(log){
		d = new Date();
		var err = new Error();
		log = '[ERROR] '+log + ' ' + d.getHours() +':'+d.getMinutes()+':'+d.getSeconds()+err.stack;
		console.log(log);
		LogSrvc.intLogs.push(log);
		return $q.when(LogSrvc.intLogs).then(function(data) {
	        // this is the magic
        	angular.copy(data, LogSrvc.logs);
      	});
	};

	return LogSrvc;
}]);;angular.module('OEPlayer')
.service('OverlaySrvc',['$rootScope',function($rootScope){
	
	var OverlaySrvc = this;
	OverlaySrvc.open = function(type,data){
        OverlaySrvc.type = type;
        OverlaySrvc.data = data;
        $rootScope.$emit('open-overlay');
	};

	OverlaySrvc.close = function(){
		$rootScope.$emit('close-overlay');	
	};

}]);;angular.module('OEPlayer')
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

	return PlayerSrvc;
}]);;angular.module('OEPlayer')
.service('SettingsSrvc',['$rootScope',function($rootScope){

	SettingsSrvc = {
		crossfadeIn:parseInt(localStorage.getItem('crossfadeIn'))|| 1000,
		crossfadeOut:parseInt(localStorage.getItem('crossfadeOut'))|| 1000,
		skipCrossfadeOut:parseInt(localStorage.getItem('skipCrossfadeOut'))|| 500,
		onlineCheck:parseInt(localStorage.getItem('onlineCheck'))|| 1,
		animations:localStorage.getItem('animations')|| 1,
		pushToPlayTime:parseInt(localStorage.getItem('pushToPlayTime'))|| 1,
		minEnergyPlaylist:parseInt(localStorage.getItem('minEnergyPlaylist')) || 50,
		lang:localStorage.getItem('languages') || 'English'
	};

	SettingsSrvc.setSetting = function(setting,value){
		SettingsSrvc[setting] = value;
		localStorage.setItem(setting,value);
	};

	return SettingsSrvc;

}]);;angular.module('OEPlayer')
.service('StatusSrvc',[function(){

	var StatusSrvc = {};

	StatusSrvc.setStatus = function(status){
		StatusSrvc.status = status;
	};

	StatusSrvc.clearStatus = function(){
		StatusSrvc.status = '';
	};

	return StatusSrvc;
}]);