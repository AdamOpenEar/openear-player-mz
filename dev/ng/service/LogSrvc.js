angular.module('OEPlayer')
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
}]);