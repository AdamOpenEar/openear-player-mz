angular.module('OEPlayer')
.service('SettingsSrvc',['$rootScope',function($rootScope){

	SettingsSrvc = {
		crossfadeIn:parseInt(localStorage.getItem('crossfadeIn'))|| 500,
		crossfadeOut:parseInt(localStorage.getItem('crossfadeOut'))|| 500,
		skipCrossfadeOut:parseInt(localStorage.getItem('skipCrossfadeOut'))|| 500,
		onlineCheck:parseInt(localStorage.getItem('onlineCheck'))|| 1,
		animations:localStorage.getItem('animations')|| 2,
		pushToPlayTime:parseInt(localStorage.getItem('pushToPlayTime'))|| 1,
		minEnergyPlaylist:parseInt(localStorage.getItem('minEnergyPlaylist')) || 50,
		energyTime:parseInt(localStorage.getItem('energyTime'))|| 1,
		lang:localStorage.getItem('languages') || 'English',
		restartTime:parseFloat(localStorage.getItem('restartTime')) || 4,
		fileSize:parseFloat(localStorage.getItem('fileSize')) || 2,
		errors:parseFloat(localStorage.getItem('errors'))|| 1,
		volume:parseInt(localStorage.getItem('volume')) || 10,
		outputDevice:localStorage.getItem('outputDevice') || 'default',
		zoneName:localStorage.getItem('zoneName') || '',
		muteOnNoSchedule:parseInt(localStorage.getItem('muteOnNoSchedule')) || 2
	};

	SettingsSrvc.setSetting = function(setting,value){
		SettingsSrvc[setting] = value;
		localStorage.setItem(setting,value);
	};

	return SettingsSrvc;

}]);
