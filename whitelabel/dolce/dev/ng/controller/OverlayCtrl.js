/*jshint -W083 */
angular.module('OEPlayer')
.controller('OverlayCtrl',['$scope','$rootScope','OverlaySrvc','$element','config',function($scope,$rootScope,OverlaySrvc,$element,config){
	
	var unbindOpen = $rootScope.$on('open-overlay',function(){
		$scope.overlayTemplate = null;
		$scope.overlayTemplate = config.template+'overlay-'+OverlaySrvc.type+'.html';
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
.controller('OverlayHelpCtrl',['$scope',function($scope){
  $scope.faqs = [
    {q:'How do I change my playlists?',a:'To add or remove playlists, log into your business admin account.'},
    {q:'If I block a track, will it be blocked forever?',a:'Yes. The track will be blocked on this player always.'},
    {q:'How do I change my schedule?',a:'To change your schedule, log into your business admin account.'},
    {q:'How does the Energy Slider work?',a:'All tracks on Open Ear are tagged with an energy level. The Energy Slider allows you to set an energy level for a specific period of time.'},
    {q:'Why am I asked for microphone access?',a:'This is so the player can access all your output devices, like additional sound cards.'},
    {q:'How do I change fade out time?',a:'In settings, you can change the fade time to between 2-10 seconds.'},
    {q:'How do I get updates?',a:'Open Ear updates 10% of your library every month automatically. Alternatively, you can add and change playlists using your business account.'}
  ]
}])
.controller('OverlayQueueCtrl',['OverlaySrvc','$scope','QueueSrvc','$rootScope','HTTPFactory',function(OverlaySrvc,$scope,QueueSrvc,$rootScope,HTTPFactory){


    var setQueue = function(){
        $scope.tracks = [];
        $scope.tracks = angular.copy(QueueSrvc.tracks);
        if(QueueSrvc.currIndex > 0){
            for (var i = 0; i < QueueSrvc.currIndex; i++) {
                var track = $scope.tracks.shift();
                $scope.tracks.push(track);
            }
        }
    }

    var nextTrack = function(){
        var track = $scope.tracks.shift();
        $scope.tracks.push(track);
        if($scope.tracks[0].queued){
            QueueSrvc.queuePosition--;
        }
    }
    $scope.init = function(){
        setQueue();
    }

    $scope.init();

    $scope.queueTrack = function(index){
        var track = $scope.tracks[index];
        $scope.tracks.splice(index,1);
        $scope.tracks.splice(QueueSrvc.queuePosition,0,track);
        QueueSrvc.updateQueue(angular.copy(track));
        track.queued = true;
    }

    $rootScope.$on('queue:set',function(){
        setQueue();
    });

    $rootScope.$on('queue:nexttrack',function(){
        nextTrack();
    });

    //block track
    $scope.blockTrack = function(track){
        var c = confirm('Are you sure you want to block this track?');
        if(c){
            //set blocked on local storage if offline - sent on init
            HTTPFactory.blockTrack(track.id).success(function(){
                track.blocked = true;
            }).error(function(){
                var blocked = JSON.parse(localStorage.getItem('blocked'));
                blocked.push(track.id);
                localStorage.setItem(blocked);
            });
        }
    };

}])
.controller('OverlayLastPlayedCtrl',['$scope','OverlaySrvc',function($scope,OverlaySrvc){

    var init = function(){
        $scope.tracks = OverlaySrvc.data;
    }

    init();

    //block track
    $scope.blockTrack = function(track){
        var c = confirm('Are you sure you want to block this track?');
        if(c){
            //set blocked on local storage if offline - sent on init
            HTTPFactory.blockTrack(track.id).success(function(){
                track.blocked = true;
            }).error(function(){
                var blocked = JSON.parse(localStorage.getItem('blocked'));
                blocked.push(track.id);
                localStorage.setItem(blocked);
            });
        }
    };
}])
.controller('OverlayBlockedCtrl',['FileFactory','$scope','config',function(FileFactory,$scope,config){

    FileFactory.readJSON(config.local_path,'blocked.json')
        .then(function(data){
            $scope.tracks = JSON.parse(data);
        });

}])
.controller('OverlayPlaylistCtrl',['$scope','config',function($scope,config){

    $scope.selectedView = {
        name:'ptp',
        url:config.template+'playlists-ptp.html'
    };

    $scope.selectView = function(name,url){
        $scope.selectedView = {
            name:name,
            url:url
        };
    };
}])
.controller('OverlaySettingsCtrl',['$scope','SettingsSrvc','FileFactory','LogSrvc','config','HTTPFactory','$rootScope','$timeout','ActionSrvc',function($scope,SettingsSrvc,FileFactory,LogSrvc,config,HTTPFactory,$rootScope,$timeout,ActionSrvc){

    $scope.settings = {};
    $scope.settings.crossfadeIn = SettingsSrvc.crossfadeIn/100;
    $scope.settings.crossfadeOut = SettingsSrvc.crossfadeOut/100;
    $scope.settings.skipCrossfadeOut = SettingsSrvc.skipCrossfadeOut/100;
    $scope.settings.onlineCheck = SettingsSrvc.onlineCheck;
    $scope.settings.animations = SettingsSrvc.animations;
    $scope.settings.pushToPlayTime = SettingsSrvc.pushToPlayTime;
    $scope.settings.minEnergyPlaylist = SettingsSrvc.minEnergyPlaylist;
    $scope.settings.energyTime = SettingsSrvc.energyTime;
    $scope.settings.languages = SettingsSrvc.lang;
    $scope.settings.restartTime = SettingsSrvc.restartTime;
    $scope.settings.fileSize = SettingsSrvc.fileSize;
    $scope.settings.loginHash = localStorage.getItem('loginHash') || null;
    $scope.settings.volume = SettingsSrvc.volume;
    $scope.settings.outputDevice = SettingsSrvc.outputDevice;
    $scope.settings.zoneName = SettingsSrvc.zoneName;
    $scope.settings.muteOnNoSchedule = SettingsSrvc.muteOnNoSchedule;

    $scope.cfTimes = [2,3,4,5,6,7,8,9,10];
    $scope.pushPlayLengths = [1,2,3,4,5];
    $scope.energyLengths = [1,2,3,4,5];
    $scope.volumes = [1,2,3,4,5,6,7,8,9,10];
    $scope.restartTimes = [
        {time:4,display:'4.00am'},
        {time:4.3,display:'4.30am'},
        {time:5,display:'5.00am'},
        {time:5.3,display:'5.30am'}
    ];
    $scope.onlineCheck = [
        {type:1,name:'Standard'},
        {type:2,name:'Alternative'}
    ];
    $scope.fileSizes = [
        {type:1,display:'Small'},
        {type:2,display:'Standard'}
    ];
    $scope.minEnergyPlaylist = [30,40,50,60,70,80,90];
    $scope.languages = ['English','Spanish','Portuguese'];
    $scope.version = config.version;
    $scope.outputDevices = [];

    var formatBytes = function(bytes,decimals) {
        if(bytes === 0) return '0 Byte';
        var k = 1024; // or 1024 for binary
        var dm = decimals + 1 || 3;
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        var i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    FileFactory.getAvailableSpace()
        .then(function(res){
            $scope.available = formatBytes(res[1] - res[0]);
        },function(err){
            console.log(err);
        });
    $scope.noTracks = 0;
    FileFactory.readDirectory('')
        .then(function(data){
            //loop local files and push to local track array
            if(data.length > 0){
                for (var i = data.length - 1; i >= 0; i--) {
                    if(data[i].name.indexOf('.json') == -1){
                        $scope.noTracks++;
                    }
                }
            }
        });
    var timeout = $timeout(function(){
        navigator.mediaDevices.getUserMedia({audio:true,video:false})
            .then(function(){return navigator.mediaDevices.enumerateDevices()})
            .then(function(devices){
                for (var i = devices.length - 1; i >= 0; i--) {
                    if(devices[i].kind === 'audiooutput'){
                        $scope.outputDevices.push(devices[i]);
                    }
                }
            })
            .catch(function(err){
                alert('Error getting output devices.');
            });
        $timeout.cancel(timeout);
        timeout = undefined;
    },1000);

    $scope.changeOutputDevice = function(){
        var c = confirm('This will restart the player. OK?');
        if(c){
            SettingsSrvc.setSetting('outputDevice',$scope.settings.outputDevice);
            window.location.reload();
        }
    }

    $scope.changeSetting = function(setting){
        if(setting == 'crossfadeIn' || setting == 'crossfadeOut' || setting == 'skipCrossfadeOut'){
            SettingsSrvc.setSetting(setting,$scope.settings[setting]*100);
        } else if(setting == 'languages'){
            var c = confirm($scope.lang.settings.changeLang);
            if(c){
                SettingsSrvc.setSetting(setting,$scope.settings[setting]);
                window.location.reload();
            }
        } else if(setting == 'volume'){
          ActionSrvc.setAction('changed volume to',$scope.settings[setting]);
          SettingsSrvc.setSetting(setting,$scope.settings[setting]);
        } else {
            SettingsSrvc.setSetting(setting,$scope.settings[setting]);
        }
    };

    $scope.saveLoginHash = function(){
        if($scope.settings.loginHash){
            var c = confirm('This will restart the player. OK?');
            if(c){
                localStorage.removeItem('Authentication');
                localStorage.setItem('loginHash',$scope.settings.loginHash);
                window.location.reload();
            }
        } else {
            alert('No hash set');
        }
    };

    $scope.clearLoginHash = function(){
        $scope.settings.loginHash = null;
        localStorage.removeItem('loginHash');
    };

    $scope.saveZoneName = function(){
        var c = confirm('This will restart the player. OK?');
        if(c){
            localStorage.setItem('zoneName',$scope.settings.zoneName);
            window.location.reload();
        }
    };

    $scope.clearZoneName = function(){
        $scope.settings.zoneName = null;
        localStorage.removeItem('zoneName');
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
            localStorage.removeItem('backlog');
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

    $scope.changeFileSize = function(){
        var c = confirm('This will delete the library and redownload the tracks. Are you sure?');
        if(c){
            SettingsSrvc.setSetting('fileSize',$scope.settings.fileSize);
            FileFactory.readDirectory('')
                .then(function(data){
                    for (var i = data.length - 1; i >= 0; i--) {
                        FileFactory.deleteFile('',data[i].name)
                            .then(function(res){
                                LogSrvc.logSystem(res);
                            });
                    }
                    var dt = {
                        fileSize:$scope.settings.fileSize
                    };
                    HTTPFactory.setSettings(dt)
                        .success(function(data){
                            window.location.reload();
                        })
                        .error(function(err){
                            LogSrvc.logError(err);
                        });
                });
        }
    };

    $scope.changeVolume = function(){
        SettingsSrvc.setSetting('volume',$scope.settings.volume);
        $rootScope.$emit('volume-change');
    };

}])
.controller('OverlayLibraryPlaylistsCtrl',['$scope','FileFactory','config','PlayerSrvc','$rootScope','ActionSrvc',function($scope,FileFactory,config,PlayerSrvc,$rootScope,ActionSrvc){

    $scope.init = function(){
        FileFactory.readJSON(config.local_path,'playlists.json')
            .then(function(data){
                var data = JSON.parse(data);
                $scope.playlists = data.playlists;
                $scope.new = data.new;
                $scope.genres = data.genres;
            });
    };

    $rootScope.$on('playlist:ready',function(){
        $scope.init();  
    });

    $scope.init();

    $scope.playPlaylist = function(playlist,type,name){

        if(type === 'genre'){
            var pl = {
                tracks:playlist,
                name:name
            }
            PlayerSrvc.pushToPlay(pl);
            ActionSrvc.setAction('started push to play with',name);
        } else if(type === 'new'){
            var pl = {
                tracks:playlist,
                name:'New tracks'
            }
            PlayerSrvc.pushToPlay(pl);
            ActionSrvc.setAction('started push to play with',pl.name);
        } else {
            PlayerSrvc.pushToPlay(playlist);
            ActionSrvc.setAction('started push to play with',playlist.name);
        }
    };

}])
.controller('OverlayLibraryPlaylistsTimeCtrl',['$scope','FileFactory','config','PlayerSrvc','$rootScope',function($scope,FileFactory,config,PlayerSrvc,$rootScope){

    $scope.init = function(){
        FileFactory.readJSON(config.local_path,'schedule-time.json')
            .then(function(data){
                $scope.playlists = JSON.parse(data);
            });
    };
    $scope.init();

    $scope.playSchedule = function(){
        PlayerSrvc.ptpSchedule($scope.playlists);
        $scope.closeOverlay();
    };

}])
.controller('OverlayScheduleCtrl',['$scope','config','FileFactory','HTTPFactory',function($scope,config,FileFactory,HTTPFactory){


    var init = function(){
        $scope.schedules = [];
        $scope.today = moment().format('YYYY MM DD');
        FileFactory.readJSON(config.local_path,'schedule.json')
            .then(function(data){
                var schedule = JSON.parse(data);
                if(schedule.code === 0){
                    //display 'no scheudle'
                } else {
                    //find todays schedule
                    angular.forEach(schedule.playlists,function(playlist){
                        if(checkPlaylistStart(playlist)){
                            setScheduleVars(playlist);
                            HTTPFactory.getPlaylistMeta(playlist.playlist_id)
                                .success(function(meta){
                                    playlist.meta = meta;
                                },function(err){

                                })
                            $scope.schedules.push(playlist);
                        }
                    });
                }
            },function(error){
                LogSrvc.logSystem(error);
            });
    };

    var setScheduleVars = function(schedule){

            var start = new Date(schedule.start_time*1000);
            var end = new Date(schedule.end_time*1000);

            var diff = end - start;
            var oneHour = 1000*60*60;
            var diffHours = diff/oneHour;
            
            //if midnight overlap
            if(schedule.midnight_overlap == 1){
                var toMidnight = 24 - start.getHours();
                schedule.height = ((toMidnight + parseInt(end.getHours())) * 60 + parseInt(end.getMinutes()))/2;
            } else {
                schedule.height = (diffHours.toFixed(2) * 30);
            }
            //offset in minutes - 30px = 1 hour
            schedule.offset = ((parseInt(start.getHours()) * 60) + parseInt(start.getMinutes()))/2;
            //if time is midnight to 3am
            if(start.getHours() >= 0 && start.getHours() < 4){
                schedule.offset += 20*30;
                schedule.offset += 30*4;
            }
            //offset for 4am start
            schedule.offset = schedule.offset - (30*4);

            //display time
            schedule.duration = (schedule.height/30);
    }


    var checkPlaylistStart = function(playlist){
        //if playlist is for today
        var now = moment();
        if(playlist.day == (now.weekday() === 0 ? 6 : now.weekday() - 1)){
            return true;
        } else {
            return false;
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

    init();

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

}]);
