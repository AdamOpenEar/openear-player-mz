angular.module('OEPlayer')
.service('SettingsSrvc',['$rootScope',function($rootScope){

	SettingsSrvc = {
		crossfadeIn:parseInt(localStorage.getItem('crossfadeIn'))|| 500,
		crossfadeOut:parseInt(localStorage.getItem('crossfadeOut'))|| 500,
		skipCrossfadeOut:parseInt(localStorage.getItem('skipCrossfadeOut'))|| 500,
		onlineCheck:parseInt(localStorage.getItem('onlineCheck'))|| 1,
		animations:localStorage.getItem('animations')|| 1,
		pushToPlayTime:parseInt(localStorage.getItem('pushToPlayTime'))|| 1,
		minEnergyPlaylist:parseInt(localStorage.getItem('minEnergyPlaylist')) || 50,
		lang:localStorage.getItem('languages') || 'English',
		restartTime:parseFloat(localStorage.getItem('restartTime')) || 4
	};

	SettingsSrvc.setSetting = function(setting,value){
		SettingsSrvc[setting] = value;
		localStorage.setItem(setting,value);
	};

	return SettingsSrvc;

}]);