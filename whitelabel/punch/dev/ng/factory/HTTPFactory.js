angular.module('OEPlayer')
.factory('HTTPFactory',['$http','config','$q','SettingsSrvc',function($http,config,$q,SettingsSrvc){
	
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
		getScheduleTime:function(){
			return $http.get(config.api_url+'schedule-time');
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
        getTrackSrc:function(id){
            return $http.get(config.api_url+'track/'+id);
        },
        getTrackSrcSmall:function(id){
            return $http.get(config.api_url+'track-small/'+id);
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
        },
        sendError:function(data){
            return $http.post(config.api_url+'send-error',{error:data});
        },
        getSettings:function(){
            return $http.get(config.api_url+'settings');
        }
	};
}])
.factory("HttpErrorInterceptorModule", ['$q', '$location','$rootScope',function($q,$location,$rootScope){
	return {
        'responseError': function(rejection) {
            // do something on error
            if(rejection.status === 401){
                localStorage.removeItem('Authentication');
                localStorage.removeItem('venue');
            	window.location.reload();
            }
            return $q.reject(rejection);
         }
     };
}]);
