angular.module('OEPlayer')
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