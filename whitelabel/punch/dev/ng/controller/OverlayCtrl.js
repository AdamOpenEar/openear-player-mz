/*jshint -W083 */
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
.controller('OverlayPlaylistCtrl',['$scope',function($scope){

    $scope.selectedView = {
        name:'ptp',
        url:'playlists-ptp.html'
    };

    $scope.selectView = function(name,url){
        $scope.selectedView = {
            name:name,
            url:url
        };
    };
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
.controller('OverlaySettingsCtrl',['$scope','SettingsSrvc','FileFactory','LogSrvc','config','HTTPFactory','$rootScope',function($scope,SettingsSrvc,FileFactory,LogSrvc,config,HTTPFactory,$rootScope){

    $scope.settings = {};
    $scope.settings.crossfadeIn = SettingsSrvc.crossfadeIn/100;
    $scope.settings.crossfadeOut = SettingsSrvc.crossfadeOut/100;
    $scope.settings.skipCrossfadeOut = SettingsSrvc.skipCrossfadeOut/100;
    $scope.settings.onlineCheck = SettingsSrvc.onlineCheck;
    $scope.settings.animations = SettingsSrvc.animations;
    $scope.settings.pushToPlayTime = SettingsSrvc.pushToPlayTime;
    $scope.settings.minEnergyPlaylist = SettingsSrvc.minEnergyPlaylist;
    $scope.settings.languages = SettingsSrvc.lang;
    $scope.settings.restartTime = SettingsSrvc.restartTime;
    $scope.settings.fileSize = SettingsSrvc.fileSize;
    $scope.settings.loginHash = localStorage.getItem('loginHash') || null;
    $scope.settings.volume = SettingsSrvc.volume;

    $scope.cfTimes = [2,3,4,5,6,7,8,9,10];
    $scope.pushPlayLengths = [1,2,3];
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

    $scope.changeSetting = function(setting){
        if(setting == 'crossfadeIn' || setting == 'crossfadeOut' || setting == 'skipCrossfadeOut'){
            SettingsSrvc.setSetting(setting,$scope.settings[setting]*100);
        } else if(setting == 'languages'){
            var c = confirm($scope.lang.settings.changeLang);
            if(c){
                SettingsSrvc.setSetting(setting,$scope.settings[setting]);
                window.location.reload();
            }
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
.controller('OverlayLibraryPlaylistsCtrl',['$scope','FileFactory','config','PlayerSrvc','$rootScope',function($scope,FileFactory,config,PlayerSrvc,$rootScope){

    $scope.init = function(){
        FileFactory.readJSON(config.local_path,'playlists.json')
            .then(function(data){
                $scope.playlists = JSON.parse(data);
            });
    };
    $scope.init();

    $scope.playPlaylist = function(playlist){
        PlayerSrvc.pushToPlay(playlist);
        $scope.closeOverlay();
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
