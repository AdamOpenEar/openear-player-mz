angular.module('OEPlayer')
.factory('HTTPFactory',['$http','config','$q',function($http,config,$q){
	
	return {
		login:function(data){
			return $http.post(config.api_url+'login',data);
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
                responseType: "arraybuffer"
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
        }
	};
}])
.factory("HttpErrorInterceptorModule", ['$q', '$location','$rootScope',function($q,$location,$rootScope){
	return {
        'responseError': function(rejection) {
            // do something on error
            if(rejection.status === 401 || rejection.status === 500){
            	$rootScope.$emit('global-pause');
                $location.path('/login');
            }
            return $q.reject(rejection);
         }
     };
}]);
