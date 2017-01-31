angular.module('OEPlayer')
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

}]);