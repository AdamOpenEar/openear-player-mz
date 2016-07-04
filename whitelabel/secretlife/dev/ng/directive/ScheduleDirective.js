angular.module('OEPlayer')
.directive('scheduleBox',['HTTPFactory','$document',function(HTTPFactory,$document){

    return{
        restrict:'E',
        scope:{
            schedule:'=schedule',
            dayIndex:'=',
            index:'=',
            type:'='
        },
        replace:true,
        templateUrl:'schedule-box.html',
        controller: function($scope){
            
            $scope.activateBox = function(){
                var active = angular.element(document.querySelectorAll('.schedule-box.active'));
                if(active.length === 0 && !$scope.active){
                    //for cancelled
                    $scope.saved = {};
                    $scope.saved.height = angular.copy($scope.height);
                    $scope.saved.offset = angular.copy($scope.offset);
                    //break data bind
                    $scope.saved.schedule = angular.copy($scope.schedule);
                    $scope.active = true;

                } else if(!$scope.active) {
                    //alert('Please cancel editing current schedule to edit another.');
                    active.isolateScope().saveOrCancel();
                    //for cancelled
                    $scope.saved = {};
                    $scope.saved.height = $scope.height;
                    $scope.saved.offset = $scope.offset;
                    //break data bind
                    $scope.saved.schedule = angular.copy($scope.schedule);
                    $scope.active = true;
                    
                }
            };

            $scope.moveMinutes = function(minutes) {
                $scope.schedule.start = new Date($scope.schedule.start.getTime() + minutes*60000);
                //double for 30px an hour
                $scope.schedule.end = new Date($scope.schedule.start.getTime() + parseInt($scope.height)*120000);
            };
            $scope.addMinutes = function(minutes){
                $scope.schedule.end = new Date($scope.schedule.start.getTime() + parseInt($scope.height)*120000);
            };

            $scope.checkMidnight = function(){
                var start = moment($scope.schedule.start);
                var end = moment($scope.schedule.end);
                //set midnight overlap
                if(end.hours() <= 4 && start.hours() <= 23 && start.hours() > 4){
                    $scope.schedule.midnight_overlap = 1;
                } else {
                    $scope.schedule.midnight_overlap = 0;
                }
            };
            $scope.saveSchedule = function(){

                $scope.checkMidnight();
                
                if($scope.type == 'template'){
                    HTTPFactory.updateTemplate($scope.schedule).success(function(data){
                        if(!data.error){
                            $scope.active = false;
                        }else{
                            alert(data.error);
                        }
                    });
                } else {
                    HTTPFactory.updateCalendar($scope.schedule).success(function(data){
                        if(!data.error){
                            $scope.active = false;
                        }else{
                            alert(data.error);
                        }
                    });
                }
            };
            $scope.deleteTemplate = function(elem){
                if($scope.type == 'template'){
                    HTTPFactory.deleteTemplate($scope.schedule.id).success(function(data){
                        if(!data.error){
                            elem.remove();
                            var index = $scope.$parent.schedules[$scope.dayIndex].schedule.indexOf($scope.schedule);
                            $scope.$parent.schedules[$scope.dayIndex].schedule.splice(index,1);
                        }else{
                            alert(data.error);
                        }
                    });
                } else {
                    HTTPFactory.deleteCalendar($scope.schedule.id).success(function(data){
                        if(!data.error){
                            elem.remove();
                            var index = $scope.$parent.schedules[$scope.dayIndex].schedule.indexOf($scope.schedule);
                            $scope.$parent.schedules[$scope.dayIndex].schedule.splice(index,1);
                        }else{
                            alert(data.error);
                        }
                    });
                }
            };

            $scope.saveOrCancel = function(){

                if($scope.height == $scope.saved.height && $scope.offset == $scope.saved.offset){
                    $scope.active = false;
                } else {
                    var r = confirm("Do you want to save or cancel current editing?");
                    if(r){
                        $scope.schedule.day = $scope.dayIndex;
                        $scope.saveSchedule();
                        $scope.active = false;
                    } else {
                        $scope.height = $scope.saved.height;
                        $scope.offset = $scope.saved.offset;
                        $scope.schedule = $scope.saved.schedule;
                        $scope.active = false;
                    }
                }

            };

        },
        link: function(scope, elem, attrs) {

            //if box is on sunday, add class for controls
            if(scope.dayIndex == 6){
                elem.addClass('controls-left');
            }
            //can't handle 1/2 hour playlists
            var diff = scope.schedule.end - scope.schedule.start;
            var oneHour = 1000*60*60;
            var diffHours = diff/oneHour;
            
            //if midnight overlap
            if(scope.schedule.midnight_overlap == 1){
                var toMidnight = 24 - scope.schedule.start.getHours();
                scope.height = ((toMidnight + parseInt(scope.schedule.end.getHours())) * 60 + parseInt(scope.schedule.end.getMinutes()))/2;
            } else {
                scope.height = (diffHours.toFixed(2) * 30);
                scope.height +=1;
            }
            //offset in minutes - 30px = 1 hour
            scope.offset = ((parseInt(scope.schedule.start.getHours()) * 60) + parseInt(scope.schedule.start.getMinutes()))/2;
            //if time is midnight to 3am
            if(scope.schedule.start.getHours() >= 0 && scope.schedule.start.getHours() < 4){
                scope.offset += 20*30;
                scope.offset += 30*4;
            }
            //offset for 4am start
            scope.offset = scope.offset - (30*4);

            //display time
            scope.duration = (scope.height/30);
            //control functions
            scope.moveUp = function(event){
                event.stopPropagation();
                if(scope.offset > 0){
                    scope.offset -= 15;
                    //why am i doing this?
                    scope.moveMinutes(-30);
                }
            };
            scope.moveDown = function(event){
                event.stopPropagation();
                if(scope.height + scope.offset < 720){
                    scope.offset += 15;               
                    scope.moveMinutes(30); 
                }
            };

            scope.delete = function(event){
                event.stopPropagation();
                scope.deleteTemplate(elem);
            };
            scope.cancel = function(event){
                event.stopPropagation();
                scope.height = scope.saved.height;
                scope.offset = scope.saved.offset;
                scope.schedule = scope.saved.schedule;
                scope.active = false;
            };

            scope.save = function(event){
                event.stopPropagation();
                scope.schedule.day = scope.dayIndex;
                scope.saveSchedule();
                
            };

            scope.increaseLength = function(event){
                event.stopPropagation();
                if(scope.height + scope.offset < 720){
                    scope.height += 15;
                    scope.duration += 0.5;
                    scope.addMinutes(30);
                }
            };

            scope.decreaseLength = function(event){
                event.stopPropagation();
                if(scope.height > 15){
                    scope.height -= 15;
                    scope.duration -= 0.5;
                    scope.addMinutes(-30); 
                }
            };

            //draggable
            var startY;
            var elHeight;

            /*elem.on('mousedown', function(event) {

                event.preventDefault();
                if(scope.active){
                    startY = elem.css('top');

                    $document.on('mousemove', mousemove);
                    $document.on('mouseup', mouseup);
                }

            });

            function moveSchedule(event,direction){

                if(direction == 'up'){
                    var y = parseInt(startY) - 15;
                    if(y > -1)
                        scope.moveMinutes(-30);
                } else {
                    var y = parseInt(startY) + 15;
                    scope.moveMinutes(30); 
                }

                if(y > -1 ){        
                    elem.css({top: y + 'px'});
                    scope.offset = y;
                    startY = elem.css('top');
                }
            }
            var moves = 0;
            var direction = 0;
            function mousemove(event) {

                moves++;
                if(event.pageY%7 == 0){

                    if(event.pageY < direction){
                        moveSchedule(event,'up');
                    } else if(direction != 0){
                        moveSchedule(event,'down')
                    }
                    direction = event.pageY;
                }
            }

            function mouseup() {
                $document.off('mousemove', mousemove);
                $document.off('mouseup', mouseup);
            }*/


        }
    };

}])
.directive('scheduleBoxInactive',[function(){

    return{
        restrict:'E',
        scope:{
            schedule:'=schedule',
            dayIndex:'=',
            index:'='
        },
        replace:true,
        templateUrl:'schedule-box-inactive.html',
        link: function(scope, elem, attrs) {

            //can't handle 1/2 hour playlists
            var diff = scope.schedule.end - scope.schedule.start;
            var oneHour = 1000*60*60;
            var diffHours = diff/oneHour;
            
            //if midnight overlap
            if(scope.schedule.midnight_overlap == 1){
                var toMidnight = 24 - scope.schedule.start.getHours();
                scope.height = ((toMidnight + parseInt(scope.schedule.end.getHours())) * 60 + parseInt(scope.schedule.end.getMinutes()))/2;
            } else {
                scope.height = (diffHours.toFixed(2) * 30);
                scope.height +=1;
            }
            //offset in minutes - 30px = 1 hour
            scope.offset = ((parseInt(scope.schedule.start.getHours()) * 60) + parseInt(scope.schedule.start.getMinutes()))/2;
            //if time is midnight to 3am
            if(scope.schedule.start.getHours() >= 0 && scope.schedule.start.getHours() < 4){
                scope.offset += 20*30;
                scope.offset += 30*4;
            }
            //offset for 4am start
            scope.offset = scope.offset - (30*4);

            //display time
            scope.duration = (scope.height/30);

        }
    };

}])
.filter('makeTime', [function () {
    return function (item) {
        return item + '.00';
    };
}]);