angular.module('OEPlayer')
.service('ActionSrvc',['HTTPFactory',function(HTTPFactory){
  var ActionSrvc = {};
  ActionSrvc.setAction = function(action,subject){
    var data = {
      action:action,
      subject:subject ? subject : ''
    }
    HTTPFactory.sendAction(data)
      .success(function(success){console.log(success)})
      .error(function(err){console.log(err)})
  }
  return ActionSrvc
}])