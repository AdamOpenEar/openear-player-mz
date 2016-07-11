angular.module('OEPlayer')
.service('LogSrvc',['HTTPFactory',function(HTTPFactory){
	
	var LogSrvc = {};
	
	var d, log;

	LogSrvc.logSystem = function(log){
		d = new Date();
		log = '[SYSTEM] '+log + ' ' + d.getHours() +':'+d.getMinutes()+':'+d.getSeconds();
		console.log(log);
	};
	LogSrvc.logError = function(log){
		d = new Date();
		var err = new Error();
		log = '[ERROR] '+log + ' ' + d.getHours() +':'+d.getMinutes()+':'+d.getSeconds()+err.stack;
		console.log(log);
		HTTPFactory.sendError(log).success(function(success){
			console.log(success);
		}).error(function(err){
			console.log(err);
		})
	};

	return LogSrvc;
}]);