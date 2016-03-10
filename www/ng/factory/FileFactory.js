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
			var blob = new Blob([data], {type: 'audio/mpeg'});
			FileSystem.writeFile(dir,filename.toString(),blob,blnReplace)
				.then(function(result){
					deferred.resolve(result);
				},function(error){
					deferred.reject(error);
				});
			return deferred.promise;
		},
		writeJSON: function(dir,filename,data,blnReplace){
			var deferred = $q.defer();
			var json = JSON.stringify(data);
			var blob = new Blob([json], {type: 'text/plain'});
			FileSystem.writeFile(dir,filename.toString(),blob,blnReplace)
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
					var blob = new Blob([(result)], {type: 'audio/mpeg'});
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
		},
		getMetadata:function(path,file){
			var deferred = $q.defer();
			FileSystem.getMetadata(path,file)
				.then(function(results){
					deferred.resolve(results);
				},function(error){
					deferred.reject(error);
				});
			return deferred.promise;	
		}
	};
}]);