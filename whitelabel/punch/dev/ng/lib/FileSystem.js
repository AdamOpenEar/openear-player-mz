angular.module('OEPlayer')
.constant('cordovaFileError', {
    1: 'NOT_FOUND_ERR',
    2: 'SECURITY_ERR',
    3: 'ABORT_ERR',
    4: 'NOT_READABLE_ERR',
    5: 'ENCODING_ERR',
    6: 'NO_MODIFICATION_ALLOWED_ERR',
    7: 'INVALID_STATE_ERR',
    8: 'SYNTAX_ERR',
    9: 'INVALID_MODIFICATION_ERR',
    10: 'QUOTA_EXCEEDED_ERR',
    11: 'TYPE_MISMATCH_ERR',
    12: 'PATH_EXISTS_ERR'
})
.factory('FileSystem',['LogSrvc','$q','$window','config','cordovaFileError',function(LogSrvc,$q,$window,config,cordovaFileError){

    var oefs = {
        fs:{},
        c:0
    };

    return {

        init: function(){
            LogSrvc.logSystem('Starting file system');
            var q = $q.defer();
            navigator.webkitPersistentStorage.requestQuota(
                10*1024*1024*1024,
                function( grantedBytes ) {
                    this.availableSpace = grantedBytes;
                    window.webkitRequestFileSystem(
                        window.PERSISTENT, 
                        grantedBytes,
                        function(fs){
                            oefs.fs = fs;
                            q.resolve('File system ready');
                        },
                        function(error){
                            LogSrvc.logError(error);
                            q.reject(error);
                        }
                    );
                },
                function(error){
                    LogSrvc.logError(error);
                    q.reject(error);
                }
            );
            return q.promise;
        },
        getAvailableSpace:function(){
            var q = $q.defer();
            navigator.webkitPersistentStorage.queryUsageAndQuota(
                function(used,quota){
                    var res = [used,quota];
                    q.resolve(res);
                },
                function(err){
                    q.reject(err);
                }
            );
            return q.promise;
        },
        checkDir: function (path, dir) {
            oefs.c++;
            var q = $q.defer();

            if ((/^\//.test(dir))) {
                q.reject('directory cannot start with \/');
            }

            try {
                var directory = path + dir;
                $window.resolveLocalFileSystemURL(directory, function (fileSystem) {
                    if (oefs.fs.root.isDirectory === true) {
                        q.resolve(fileSystem);
                    } else {
                        q.reject({code: 13, message: 'input is not a directory'});
                    }
                }, function (error) {
                    error.message = cordovaFileError[error.code];
                    q.reject(error);
                });
            } catch (err) {
                err.message = cordovaFileError[err.code];
                q.reject(err);
            }

            return q.promise;
        },
        checkFile: function (path, file) {
            oefs.c++;
            var q = $q.defer();

            if ((/^\//.test(file))) {
                q.reject('directory cannot start with \/');
            }

            try {
                var directory = path + file;
                oefs.fs.root.getFile(directory, {create:false},function() {
                    q.resolve(true);
                }, function () {
                    q.reject(false);
                });
            } catch (err) {
                err.message = cordovaFileError[err.code];
                q.reject(err);
            }

            return q.promise;
        },
        createDir: function (path, dirName, replaceBool) {
            oefs.c++;
            var q = $q.defer();

            if ((/^\//.test(dirName))) {
                q.reject('directory cannot start with \/');
            }

            replaceBool = replaceBool ? false : true;

            var options = {
                create: true,
                exclusive: replaceBool
            };

            try {
                oefs.fs.root.getDirectory(dirName, options, function (result) {
                    q.resolve(result);
                }, function (error) {
                    error.message = cordovaFileError[error.code];
                    q.reject(error);
                });
            } catch (e) {
                e.message = cordovaFileError[e.code];
                q.reject(e);
            }

            return q.promise;
        },
        createFile: function (path, fileName, replaceBool) {
            oefs.c++;
            var q = $q.defer();

            if ((/^\//.test(fileName))) {
                q.reject('file-name cannot start with \/');
            }

            replaceBool = replaceBool ? false : true;

            var options = {
                create: true,
                exclusive: replaceBool
            };

            try {
                oefs.fs.root.getFile(fileName, options, function (result) {
                    q.resolve(result);
                }, function (error) {
                    error.message = cordovaFileError[error.code];
                    q.reject(error);
                });
            } catch (e) {
                e.message = cordovaFileError[e.code];
                q.reject(e);
            }
            return q.promise;
        },
        removeDir: function (path, dirName) {
            oefs.c++;
            var q = $q.defer();

            if ((/^\//.test(dirName))) {
                q.reject('file-name cannot start with \/');
            }

            try {
                oefs.fs.root.getDirectory(dirName, {create: false}, function (dirEntry) {
                    dirEntry.remove(function () {
                    q.resolve({success: true, fileRemoved: dirEntry});
                }, function (error) {
                    error.message = cordovaFileError[error.code];
                    q.reject(error);
                });
                }, function (err) {
                    err.message = cordovaFileError[err.code];
                    q.reject(err);
                });
            } catch (e) {
                e.message = cordovaFileError[e.code];
                q.reject(e);
            }
            return q.promise;
        },
        removeFile: function (path, fileName) {
            oefs.c++;
            var q = $q.defer();

            if ((/^\//.test(fileName))) {
                q.reject('file-name cannot start with \/');
            }

            try {
                oefs.fs.root.getFile(fileName, {create: false}, function (fileEntry) {
                    fileEntry.remove(function () {
                        q.resolve({success: true, fileRemoved: fileEntry});
                    }, function (error) {
                        error.message = cordovaFileError[error.code];
                        q.reject(error);
                    });
                }, function (err) {
                    err.message = cordovaFileError[err.code];
                    q.reject(err);
                });
            } catch (e) {
                e.message = cordovaFileError[e.code];
                q.reject(e);
            }
            return q.promise;
        },
        removeRecursively: function (path, dirName) {
            oefs.c++;
          var q = $q.defer();

          if ((/^\//.test(dirName))) {
            q.reject('file-name cannot start with \/');
          }

          try {
                oefs.fs.root.getDirectory(dirName, {create: false}, function (dirEntry) {
                    dirEntry.removeRecursively(function () {
                        q.resolve({success: true, fileRemoved: dirEntry});
                    }, function (error) {
                        error.message = cordovaFileError[error.code];
                        q.reject(error);
                    });
                }, function (err) {
                    err.message = cordovaFileError[err.code];
                    q.reject(err);
                });
            } catch (e) {
                e.message = cordovaFileError[e.code];
                q.reject(e);
            }
            return q.promise;
        },
        writeFile: function (path, fileName, text, replaceBool) {
            oefs.c++;
            var q = $q.defer();

            if ((/^\//.test(fileName))) {
                q.reject('file-name cannot start with \/');
            }

            replaceBool = replaceBool ? false : true;

            var options = {
                create: true,
                exclusive: replaceBool
            };

            try {
                oefs.fs.root.getFile(fileName, options, function (fileEntry) {
                    fileEntry.createWriter(function (writer) {
                        if (options.append === true) {
                            writer.seek(writer.length);
                        }

                        if (options.truncate) {
                            writer.truncate(options.truncate);
                        }

                        writer.onwriteend = function (evt) {
                            if (this.error) {
                                q.reject(this.error);
                                LogSrvc.logError(this.error);
                            } else {
                                q.resolve(evt);
                            }
                        };

                        writer.write(text);

                        q.promise.abort = function () {
                            writer.abort();
                        };
                    });
                }, function (error) {
                    error.message = cordovaFileError[error.code];
                    q.reject(error);
                });
            } catch (e) {
                e.message = cordovaFileError[e.code];
                q.reject(e);
            }

            return q.promise;
        },
        writeExistingFile: function (path, fileName, text) {
            oefs.c++;
            var q = $q.defer();

            if ((/^\//.test(fileName))) {
                q.reject('file-name cannot start with \/');
            }

            try {

                oefs.fs.root.getFile(fileName, {create: false}, function (fileEntry) {
                    fileEntry.createWriter(function (writer) {
                        writer.seek(writer.length);

                        writer.onwriteend = function (evt) {
                            if (this.error) {
                                q.reject(this.error);
                            } else {
                                q.resolve(evt);
                            }
                        };

                        writer.write(text);

                        q.promise.abort = function () {
                            writer.abort();
                        };
                    });
                }, function (err) {
                    err.message = cordovaFileError[err.code];
                    q.reject(err);
                });
            } catch (e) {
                e.message = cordovaFileError[e.code];
                q.reject(e);
            }

            return q.promise;
        },
        readAsText: function (path, file) {
            oefs.c++;
            var q = $q.defer();

            if ((/^\//.test(file))) {
                q.reject('file-name cannot start with \/');
            }

            try {
            
                oefs.fs.root.getFile(file, {create: false}, function (fileEntry) {
                    fileEntry.file(function (fileData) {
                        var reader = new FileReader();

                        reader.onloadend = function (evt) {
                            if (evt.target.result !== undefined || evt.target.result !== null) {
                                q.resolve(evt.target.result);
                            } else if (evt.target.error !== undefined || evt.target.error !== null) {
                                q.reject(evt.target.error);
                            } else {
                                q.reject({code: null, message: 'READER_ONLOADEND_ERR'});
                            }
                        };

                        reader.readAsText(fileData);
                    });
                }, function (error) {
                    LogSrvc.logError(error.message);
                    q.reject(error);
                });
            } catch (e) {
                e.message = cordovaFileError[e.code];
                q.reject(e);
            }

            return q.promise;
        },
        readAsDataURL: function (path, file) {
            oefs.c++;
          var q = $q.defer();

          if ((/^\//.test(file))) {
            q.reject('file-name cannot start with \/');
          }

            try {
            
                oefs.fs.root.getFile(file, {create: false}, function (fileEntry) {
                    fileEntry.file(function (fileData) {
                        var reader = new FileReader();
                        reader.onloadend = function (evt) {
                            if (evt.target.result !== undefined || evt.target.result !== null) {
                                q.resolve(evt.target.result);
                            } else if (evt.target.error !== undefined || evt.target.error !== null) {
                                q.reject(evt.target.error);
                            } else {
                                q.reject({code: null, message: 'READER_ONLOADEND_ERR'});
                            }
                        };
                        reader.readAsDataURL(fileData);
                    });
                }, function (error) {
                    error.message = cordovaFileError[error.code];
                    q.reject(error);
                });
            } catch (e) {
                e.message = cordovaFileError[e.code];
                q.reject(e);
            }

            return q.promise;
        },
        readAsBinaryString: function (path, file) {
            oefs.c++;
            var q = $q.defer();

            if ((/^\//.test(file))) {
                q.reject('file-name cannot start with \/');
            }

            try {
            
                oefs.fs.root.getFile(file, {create: false}, function (fileEntry) {
                    fileEntry.file(function (fileData) {
                        var reader = new FileReader();
                        reader.onloadend = function (evt) {
                            if (evt.target.result !== undefined || evt.target.result !== null) {
                                q.resolve(evt.target.result);
                            } else if (evt.target.error !== undefined || evt.target.error !== null) {
                                q.reject(evt.target.error);
                            } else {
                                q.reject({code: null, message: 'READER_ONLOADEND_ERR'});
                            }
                        };
                        reader.readAsBinaryString(fileData);
                    });
                }, function (error) {
                    error.message = cordovaFileError[error.code];
                    q.reject(error);
                });
            } catch (e) {
                e.message = cordovaFileError[e.code];
                q.reject(e);
            }

            return q.promise;
        },
        readAsArrayBuffer: function (path, file) {
            oefs.c++;
          var q = $q.defer();

          if ((/^\//.test(file))) {
            q.reject('file-name cannot start with \/');
          }

          try {
              oefs.fs.root.getFile(file, {create: false}, function (fileEntry) {
                fileEntry.file(function (fileData) {
                  var reader = new FileReader();
                  reader.onloadend = function (evt) {
                    if (evt.target.result !== undefined || evt.target.result !== null) {
                      q.resolve(evt.target.result);
                    } else if (evt.target.error !== undefined || evt.target.error !== null) {
                      q.reject(evt.target.error);
                    } else {
                      q.reject({code: null, message: 'READER_ONLOADEND_ERR'});
                    }
                  };
                  reader.readAsArrayBuffer(fileData);
                });
              }, function (error) {
                error.message = cordovaFileError[error.code];
                q.reject(error);
              });
          } catch (e) {
            e.message = cordovaFileError[e.code];
            q.reject(e);
          }

          return q.promise;
        },
        moveFile: function (path, fileName, newPath, newFileName) {
            oefs.c++;
          var q = $q.defer();

          newFileName = newFileName || fileName;

          if ((/^\//.test(fileName)) || (/^\//.test(newFileName))) {
            q.reject('file-name cannot start with \/');
          }

          try {

              oefs.fs.root.getFile(fileName, {create: false}, function (fileEntry) {
                $window.resolveLocalFileSystemURL(newPath, function (newFileEntry) {
                  fileEntry.moveTo(newFileEntry, newFileName, function (result) {
                    q.resolve(result);
                  }, function (error) {
                    q.reject(error);
                  });
                }, function (err) {
                  q.reject(err);
                });
              }, function (err) {
                q.reject(err);
              });
          } catch (e) {
            q.reject(e);
          }
          return q.promise;
        },
        moveDir: function (path, dirName, newPath, newDirName) {
            oefs.c++;
          var q = $q.defer();

          newDirName = newDirName || dirName;

          if (/^\//.test(dirName) || (/^\//.test(newDirName))) {
            q.reject('file-name cannot start with \/');
          }

          try {
            $window.resolveLocalFileSystemURL(path, function (fileSystem) {
              oefs.fs.root.getDirectory(dirName, {create: false}, function (dirEntry) {
                $window.resolveLocalFileSystemURL(newPath, function (newDirEntry) {
                  dirEntry.moveTo(newDirEntry, newDirName, function (result) {
                    q.resolve(result);
                  }, function (error) {
                    q.reject(error);
                  });
                }, function (erro) {
                  q.reject(erro);
                });
              }, function (err) {
                q.reject(err);
              });
            }, function (er) {
              q.reject(er);
            });
          } catch (e) {
            q.reject(e);
          }
          return q.promise;
        },
        copyDir: function (path, dirName, newPath, newDirName) {
            oefs.c++;
          var q = $q.defer();

          newDirName = newDirName || dirName;

          if (/^\//.test(dirName) || (/^\//.test(newDirName))) {
            q.reject('file-name cannot start with \/');
          }

          try {
            $window.resolveLocalFileSystemURL(path, function (fileSystem) {
              oefs.fs.root.getDirectory(dirName, {create: false, exclusive: false}, function (dirEntry) {

                $window.resolveLocalFileSystemURL(newPath, function (newDirEntry) {
                  dirEntry.copyTo(newDirEntry, newDirName, function (result) {
                    q.resolve(result);
                  }, function (error) {
                    error.message = cordovaFileError[error.code];
                    q.reject(error);
                  });
                }, function (erro) {
                  erro.message = cordovaFileError[erro.code];
                  q.reject(erro);
                });
              }, function (err) {
                err.message = cordovaFileError[err.code];
                q.reject(err);
              });
            }, function (er) {
              er.message = cordovaFileError[er.code];
              q.reject(er);
            });
          } catch (e) {
            e.message = cordovaFileError[e.code];
            q.reject(e);
          }
          return q.promise;
        },
        copyFile: function (path, fileName, newPath, newFileName) {
            oefs.c++;
          var q = $q.defer();

          newFileName = newFileName || fileName;

          if ((/^\//.test(fileName))) {
            q.reject('file-name cannot start with \/');
          }

          try {
            $window.resolveLocalFileSystemURL(path, function (fileSystem) {
              oefs.fs.root.getFile(fileName, {create: false, exclusive: false}, function (fileEntry) {

                $window.resolveLocalFileSystemURL(newPath, function (newFileEntry) {
                  fileEntry.copyTo(newFileEntry, newFileName, function (result) {
                    q.resolve(result);
                  }, function (error) {
                    error.message = cordovaFileError[error.code];
                    q.reject(error);
                  });
                }, function (erro) {
                  erro.message = cordovaFileError[erro.code];
                  q.reject(erro);
                });
              }, function (err) {
                err.message = cordovaFileError[err.code];
                q.reject(err);
              });
            }, function (er) {
              er.message = cordovaFileError[er.code];
              q.reject(er);
            });
          } catch (e) {
            e.message = cordovaFileError[e.code];
            q.reject(e);
          }
          return q.promise;
        },
        readDirectory:function(path){
            oefs.c++;
            var q = $q.defer();

            //if ((/^\//.test(path))) {
            //    q.reject('directory cannot start with \/');
            //}
            try {
                oefs.fs.root.getDirectory('/',{create:false,exclusive:false},function(dirEntry){
                    var dirReader = dirEntry.createReader();
                    var entries = [];
                    var readEntries = function(){
                        dirReader.readEntries(function (results) {
                            if (!results.length) {
                                q.resolve(entries);
                            } else {
                                entries = entries.concat(Array.prototype.slice.call(results || [], 0));
                                readEntries();
                            }
                        }, function (error) {
                            q.reject(cordovaFileError[error.code]);
                        });
                    };
                    readEntries();
                },function(error){
                  q.reject(cordovaFileError[error.code]);
                });
            } catch (e) {
                q.reject(cordovaFileError[e.code]);
            }

            return q.promise;
        },        
        deleteFile:function(path,file){
            oefs.c++;
            var q = $q.defer();
            if ((/^\//.test(file))) {
                q.reject('file-name cannot start with \/');
            }
            try {
                  oefs.fs.root.getFile( file , {create: false}, function(fileEntry) {
                      fileEntry.remove(function() {
                          LogSrvc.logSystem('file '+file+' deleted');
                          q.resolve('file '+file+' deleted');
                      });
                });
            } catch(e){
                q.reject(cordovaFileError[e.code]);
            }
            return q.promise;
        },
        getMetadata:function(path,file){
            oefs.c++;
            var q = $q.defer();
            if ((/^\//.test(file))) {
                q.reject('file-name cannot start with \/');
            }
            try {
                  oefs.fs.root.getFile( file , {}, function(fileEntry) {
                      fileEntry.getMetadata(function(metadata) {
                          q.resolve(metadata);
                      });
                });
            } catch(e){
                q.reject(cordovaFileError[e.code]);
            }
            return q.promise;
        }
    };
}]);