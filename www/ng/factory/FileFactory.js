angular.module('OEPlayer')
.factory('FileFactory',['FileSystem','$q',function(FileSystem,$q){

	return {
		init:function(){
			var deferred = $q.defer();
			FileSystem.init()
				.then(function(result){
					deferred.resolve(result);
				},function(error){
					deferred.reject(error);
				});
			return deferred.promise;
		},
		writeTrack: function(dir,filename,data,blnReplace){
			var deferred = $q.defer();
			FileSystem.writeFile(dir,filename.toString(),data,blnReplace)
				.then(function(result){
					deferred.resolve(result);
				},function(error){
					deferred.reject(error);
				});
			return deferred.promise;
		},
		writeJSON: function(dir,filename,data,blnReplace){
			var deferred = $q.defer();
			var json = new Blob([JSON.stringify(data)], {type: 'text/plain'});
			FileSystem.writeFile(dir,filename.toString(),json,blnReplace)
				.then(function(result){
					deferred.resolve(result);
				},function(error){
					deferred.reject(error);
				});
			return deferred.promise;
		},
		readJSON:function(dir,filename){
			var deferred = $q.defer();
			FileSystem.readAsText(dir,filename)
				.then(function(result){
					deferred.resolve(result);
				},function(error){
					deferred.reject(error);
				});
			return deferred.promise;
		},
		checkFile: function(dir,filename){
			var deferred = $q.defer();
			FileSystem.checkFile(dir,filename.toString())
				.then(function(result){
					deferred.resolve(result);
				},function(error){
					deferred.reject(error);
				});
			return deferred.promise;
		},
		readTrack: function(dir,filename){
			var deferred = $q.defer();
			FileSystem.readAsArrayBuffer(dir,filename.toString())
				.then(function(result){
					var blob = new Blob([new Uint8Array(result)], {type: 'audio/mpeg'});
					deferred.resolve(blob);
				},function(error){
					deferred.reject(error);
				});
			return deferred.promise;
		},
		readDirectory: function(dir){
			var deferred = $q.defer();
			FileSystem.readDirectory(dir)
				.then(function(results){
					deferred.resolve(results);
				},function(error){
					deferred.reject(error);
				});
			return deferred.promise;
		},
		deleteFile:function(path,file){
			var deferred = $q.defer();
			FileSystem.deleteFile(path,file)
				.then(function(results){
					deferred.resolve(results);
				},function(error){
					deferred.reject(error);
				});
			return deferred.promise;	
		}
	};
}]);