angular.module('OEPlayer')
.factory('FileFactory',['FileSystem','$q',function(FileSystem,$q){

	var seq = [165,150,151,86];
	var swapIn = function(abv) {
		var data = abv;
		if(!checkSequence(abv)) {
			data = swap(abv);
			var seqData = [];
			for(var i = 0; i < data.length; i++) {
				seqData[i] =   data[i];
			}
			for(var j = 0; j < seq.length; j++) {
				seqData[data.length + j] = seq[j];
			}
			data = new Uint8Array(seqData);
		}
		return data;
	};
	var swapOut = function(abv,dir,filename) {
		var data = abv;
		if(checkSequence(abv)) {
			var noSeqData = [];
			for(var i = 0; i < data.length - 4; i++) {
				noSeqData[i] = data[i];
			}
			data = new Uint8Array(noSeqData);
			data = swap(data);
		} else {
			FileSystem.readAsArrayBuffer(dir,filename.toString())
				.then(function(result){
					var abv = new Uint8Array(result);
					abv = swapIn(abv);
					var blob = new Blob([abv], {type: 'audio/mpeg'});
					FileSystem.writeFile(dir,filename.toString(),blob,true)
						.then(function(result){
							console.log('encrypted');
						},function(error){
							console.log(error);
						});
				},function(error){
					console.log(error);
				});
		}
		return data;
	};
	var swap = function(abv) {
		for(var i = 0; i < abv.length; i+=2) {
			if(i+1 > abv.length) break;
	    	var temp = abv[i];
	    	abv[i] = abv[i + 1];
	    	abv[i + 1] = temp;
	    }
	    return abv;	
	};
	var checkSequence = function(abv) {
		for(var i = 0; i < seq.length; i++) {
			if(abv[(abv.length - 4) + i] != seq[i]){
				return false;
			}
		}
		return true;
	};

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
		getAvailableSpace:function(){
			var deferred = $q.defer();
			FileSystem.getAvailableSpace()
				.then(function(used,left){
					deferred.resolve(used,left);
				},function(error){
					deferred.reject(error);
				});
			return deferred.promise;
		},
		writeTrack: function(dir,filename,data,blnReplace){
			var deferred = $q.defer();
			var abv = new Uint8Array(data);
			abv = swapIn(abv);
			var blob = new Blob([abv], {type: 'audio/mpeg'});
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
					var abv = new Uint8Array(result);
					abv = swapOut(abv,dir,filename);
					var blob = new Blob([(abv)], {type: 'audio/mpeg'});
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