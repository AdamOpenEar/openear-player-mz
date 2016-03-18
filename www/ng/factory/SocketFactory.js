angular.module('OEPlayer')
.factory('SocketFactory',['$rootScope','$interval','LogSrvc',function($rootScope,$interval,LogSrvc){

    var socket;
    var self = this;

    var SocketFactory = function(url){
        self.socket = new WebSocket(url);
        self.socket.onopen = angular.bind(this,this.open);
        self.socket.onclose = angular.bind(this,this.close);
        self.socket.onmessage = angular.bind(this,this.receive);
        self.socket.onerror = angular.bind(this,this.error);
    };

    SocketFactory.prototype = {
        open:function(){
            var data = {token:localStorage.getItem('Authentication'),event:'ping'};
            var ping = $interval(function(){
                var pingStart = function(){
                    self.socket.send(JSON.stringify(data));
                };
                pingStart();
            },30000);
            $rootScope.$broadcast('socket:open');
        },
        close:function(){
            $rootScope.$broadcast('socket:closed');
        },
        receive:function(data){
            $rootScope.$broadcast('socket:message',JSON.parse(data.data));
        },
        send:function(event,data){
            var data = {
                token:localStorage.getItem('Authentication'),
                event:event,
                data:data
            };
            self.socket.send(JSON.stringify(data));
        },
        error:function(err){
            LogSrvc.logError(err);
        }

    };

    return SocketFactory;
}])
.service("guid", function () {
    var guid = (function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                       .toString(16)
                       .substring(1);
        }
        return function () {
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                   s4() + '-' + s4() + s4() + s4();
        };
    })();
    return guid;
});