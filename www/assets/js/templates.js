angular.module("templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("login.html","<div class=\"login-form\">\n	<img src=\"assets/img/logo-login.png\">\n	<form ng-submit=\"processLogin()\" role=\"form\" novalidate>\n	\n		<div class=\"form-group\">\n			<input type=\"text\" class=\"form-control\" name=\"username\" id=\"username\" placeholder=\"Username\" ng-model=\"formData.username\">\n		</div>\n\n		<div class=\"form-group\">\n			<input type=\"password\" class=\"form-control\" name=\"password\" id=\"password\" placeholder=\"Password\" ng-model=\"formData.password\">\n		</div>\n		<div class=\"form-group\">{{message}}</div>\n\n		<button type=\"submit\" class=\"btn btn-primary btn-block\">Login</button>\n\n	</form>\n</div>");
$templateCache.put("overlay-logout.html","");
$templateCache.put("overlay-playlists.html","<div ng-controller=\"OverlayPlaylistCtrl\">\n    <div class=\"overlay-header\">\n        <h1>\n            {{lang.playlists.title}}<a id=\"close-overlay\" class=\"overlay-btn\" ng-click=\"closeOverlay()\"><i class=\"fi-x\"></i></a>\n        </h1>\n    </div>\n    <div class=\"overlay-btn-group btn-group-2 clearfix\">\n        <a ng-click=\"selectView(\'ptp\',\'playlists-ptp.html\')\" ng-class=\"{active:selectedView.name == \'ptp\'}\">{{lang.playlists.sub.ptp}}</a>\n        <a ng-click=\"selectView(\'time\',\'playlists-time.html\')\" ng-class=\"{active:selectedView.name == \'time\'}\">{{lang.playlists.sub.time}}</a>\n    </div>\n\n    <div ng-include src=\"selectedView.url\"></div>\n</div>");
$templateCache.put("overlay-queue.html","<div ng-controller=\"OverlayQueueCtrl\">\n    <div class=\"overlay-header\">\n        <h1>\n            {{lang.queue.title}}<a id=\"close-overlay\" class=\"overlay-btn\" ng-click=\"closeOverlay()\"><i class=\"fi-x\"></i></a>\n        </h1>\n    </div>\n    <table class=\"oeplayer-table\">\n        <thead>\n            <tr>\n                <th>{{lang.queue.table.title}}</th>\n                <th>{{lang.queue.table.artist}}</th>\n                <th>{{lang.queue.table.album}}</th>\n                <th>{{lang.queue.table.energy}}</th>\n                <th>{{lang.queue.table.block}}</th>\n            </tr>\n        </thead>\n        <tbody>\n            <tr ng-repeat=\"track in tracks track by $index\">\n                <td>{{track.title}}</td>\n                <td>{{track.artist}}</td>\n                <td>{{track.album}}</td>\n                <td>{{track.energy}}</td>\n                <td class=\"icon\"><a ng-click=\"blockTrack(track)\"><i class=\"fi-prohibited\" ng-disabled=\"track.blocked\"></i></a></td>\n            </tr>\n        </tbody>\n    </table>\n</div>");
$templateCache.put("overlay-schedule.html","<div class=\"schedule-wrapper clearfix\" ng-controller=\"OverlayScheduleCtrl\">\n\n	<div class=\"overlay-header\">\n		<h1>\n			{{lang.schedule.title}}<a id=\"close-overlay\" class=\"overlay-btn\" ng-click=\"closeOverlay()\"><i class=\"fi-x\"></i></a>\n		</h1>\n	</div>\n\n	<div class=\"overlay-btn-group btn-group-2 clearfix\">\n		<a ng-click=\"selectView(\'template\',\'schedule-template.html\')\" ng-class=\"{active:selectedView.name == \'template\'}\">{{lang.schedule.sub.template}}</a>\n		<a ng-click=\"selectView(\'calendar\',\'schedule-calendar.html\')\" ng-class=\"{active:selectedView.name == \'calendar\'}\">{{lang.schedule.sub.cal}}</a>\n	</div>\n\n	<div ng-include src=\"selectedView.url\"></div>\n\n</div>");
$templateCache.put("overlay-settings.html","<div ng-controller=\"OverlaySettingsCtrl\">\n	<div class=\"overlay-header\">\n		<h1>\n			{{lang.settings.title}}<a id=\"close-overlay\" class=\"overlay-btn\" ng-click=\"closeOverlay()\"><i class=\"fi-x\"></i></a>\n		</h1>\n	</div>\n	<div class=\"settings-wrapper\">\n		<div class=\"settings-group\">\n			<label>{{lang.settings.language}}</label>\n			<select ng-model=\"settings.languages\" ng-options=\"language for language in languages\" ng-change=\"changeSetting(\'languages\')\"></select>\n		</div>\n		<div class=\"settings-group\">\n			<label>{{lang.settings.fadein}}</label>\n			<select ng-model=\"settings.crossfadeIn\" ng-options=\"time for time in cfTimes\" ng-change=\"changeSetting(\'crossfadeIn\')\"></select>\n		</div>\n		<div class=\"settings-group\">\n			<label>{{lang.settings.fadeout}}</label>\n			<select ng-model=\"settings.crossfadeOut\" ng-options=\"time for time in cfTimes\" ng-change=\"changeSetting(\'crossfadeOut\')\"></select>\n		</div>\n		<div class=\"settings-group\">\n			<label>{{lang.settings.skip}}</label>\n			<select ng-model=\"settings.skipCrossfadeOut\" ng-options=\"time for time in cfTimes\" ng-change=\"changeSetting(\'skipCrossfadeOut\')\"></select>\n		</div>\n		<div class=\"settings-group\">\n			<label>{{lang.settings.online}}</label>\n			<select ng-model=\"settings.onlineCheck\" ng-options=\"check.type as check.name for check in onlineCheck\" ng-change=\"changeSetting(\'onlineCheck\')\"></select>\n		</div>\n		<div class=\"settings-group\">\n			<label>{{lang.settings.restart}}{{settings.restartTime}}</label>\n			<select ng-model=\"settings.restartTime\" ng-options=\"restart.time as restart.display for restart in restartTimes\" ng-change=\"changeSetting(\'restartTime\')\"></select>\n		</div>\n		<div class=\"settings-group\">\n			<label>{{lang.settings.animations}}</label>\n			<input type=\"checkbox\" ng-model=\"settings.animations\" ng-true-value=\"1\" ng-false-value=\"2\" ng-change=\"changeSetting(\'animations\')\">\n		</div>\n		<div class=\"settings-group\">\n			<label>{{lang.settings.pushtoplay}}</label>\n			<select ng-model=\"settings.pushToPlayTime\" ng-options=\"time for time in pushPlayLengths\" ng-change=\"changeSetting(\'pushToPlayTime\')\"></select>\n		</div>\n		<div class=\"settings-group\">\n			<label>{{lang.settings.energy}}</label>\n			<select ng-model=\"settings.minEnergyPlaylist\" ng-options=\"length for length in minEnergyPlaylist\" ng-change=\"changeSetting(\'minEnergyPlaylist\')\"></select>\n		</div>\n		<div class=\"settings-group\">\n			<label>{{lang.settings.delstored}}</label>\n			<button ng-click=\"deleteJson()\">Go!</button>\n		</div>\n		<div class=\"settings-group\">\n			<label>{{lang.settings.dellib}}</label>\n			<button ng-click=\"deleteLibrary()\">Go!</button>\n		</div>\n		<div class=\"settings-group\">\n			<label>Version</label>\n			<div>{{version}}</div>\n		</div>\n	</div>\n</div>");
$templateCache.put("player.html","<div ng-controller=\"PlayerCtrl\" id=\"player-wrapper\">\n    <div id=\"menu\" ng-class=\"{display:ready}\">\n        <img src=\"assets/img/logo.png\">\n        <i ng-repeat=\"item in menu track by $index\" ng-click=\"swappingTracks || openOverlay(item.name)\" class=\"fi-{{item.icon}}\" ng-class=\"{active:item.active}\" ng-disabled=\"swappingTracks\"><span>{{item.display}}</span></i>\n        <i ng-click=\"swappingTracks || restart()\" ng-disabled=\"swappingTracks\" class=\"fi-loop\"><span>{{lang.menu.restart}}</span></i>\n        <i ng-click=\"swappingTracks || logOff()\" ng-disabled=\"swappingTracks\" class=\"fi-power\"><span>{{lang.menu.logout}}</span></i>\n    </div>\n    <div id=\"main\">\n        <div id=\"blur-wrapper\">\n            <div id=\"system-messages\">\n                <p>{{status.status}}</p>\n            </div>\n            <div id=\"track-info\" ng-class=\"{display:ready}\">\n                <div id=\"track-title\">{{currentTrack.title}}</div>\n                <div id=\"track-artist\">{{currentTrack.artist}}</div>\n                <div id=\"track-playlist\">{{player.venueName}} - {{playlist.name}} {{pushToPlay.status ? \' - Push to play \' : \'\'}} {{playlist.end ? \' - ends \'+playlist.end : \'\'}}</div>\n                <div ng-if=\"pushToPlay.status\" ng-click=\"cancelPushToPlay()\" id=\"cancel-ptp\">Cancel</div>\n            </div>\n            <div id=\"download-progress\" class=\"progress-circle\" ng-class=\"{display:!ready}\">\n                <div\n                    round-progress\n                    max=\"tracksNeeded\"\n                    current=\"unavailableTracks.length\"\n                    color=\"#26cd7d\"\n                    bgcolor=\"#1c1d25\"\n                    radius=\"100\"\n                    stroke=\"10\"\n                    semi=\"false\"\n                    rounded=\"false\"\n                    clockwise=\"false\"\n                    responsive=\"false\"\n                    duration=\"800\"\n                    animation=\"easeInOutQuart\">\n                </div>\n            </div>\n            <div id=\"track-progress\" class=\"progress-circle\" ng-class=\"{display:ready}\">\n                <div\n                    round-progress\n                    max=\"timer.durationSec\"\n                    current=\"timer.elapsedSec\"\n                    color=\"#3498db\"\n                    bgcolor=\"#30343f\"\n                    radius=\"100\"\n                    stroke=\"10\"\n                    semi=\"false\"\n                    rounded=\"false\"\n                    clockwise=\"true\"\n                    responsive=\"false\"\n                    duration=\"100\"\n                    animation=\"easeInOutQuart\">\n                </div>\n            </div>\n            <div id=\"online-status\">\n                <span ng-disabled=\"!player.online\">{{lang.player.online}}</span>\n                <span ng-disabled=\"player.online\">{{lang.player.offline}}</span>\n            </div>\n\n            <div id=\"player-controls\" ng-class=\"{display:ready}\">\n                <div id=\"skip-back\" class=\"skip-btn\">\n                    <i ng-click=\"swappingTracks || skipBack()\" class=\"fi-previous\" ng-disabled=\"swappingTracks || player.currentIndex < 1\"></i>\n                </div>\n                <div id=\"play-pause\">\n                    <i class=\"fi-play\" ng-class=\"{display:currentTrack.isPaused}\" ng-click=\"swappingTracks || playPause()\" ng-disabled=\"swappingTracks\"></i>\n                    <i class=\"fi-pause\" ng-class=\"{display:!currentTrack.isPaused}\" ng-click=\"swappingTracks || playPause()\" ng-disabled=\"swappingTracks\"></i>\n                </div>\n                <div id=\"skip-forward\" class=\"skip-btn\">\n                    <i ng-click=\"swappingTracks || skipForward()\" class=\"fi-next\" ng-disabled=\"swappingTracks\"></i>\n                </div>\n            </div>\n        </div>\n        <div class=\"track-timer\" id=\"track-duration\" ng-class=\"{display:ready}\">{{timer.duration}}</div>\n        <div class=\"track-timer\" id=\"track-elapsed\" ng-class=\"{display:ready}\">{{timer.elapsed}}</div>\n        <div id=\"last-played\">\n            <i id=\"open-last-played\" class=\"fi-play\" ng-click=\"openLastTracks()\"></i>\n            <h2>{{lang.player.lastplayed.title}}</h2>\n            <table class=\"oeplayer-table\" ng-if=\"player.lastPlayed.length > 0\">\n                <thead>\n                    <tr>\n                        <th>{{lang.player.lastplayed.table.title}}</th>\n                        <th>{{lang.player.lastplayed.table.artist}}</th>\n                        <th>{{lang.player.lastplayed.table.album}}</th>\n                        <th>{{lang.player.lastplayed.table.played}}</th>\n                        <th>{{lang.player.lastplayed.table.block}}</th>\n                    </tr>\n                </thead>\n                <tbody>\n                    <tr ng-repeat=\"track in player.lastPlayed track by $index\">\n                        <td>{{track.title}}</td>\n                        <td>{{track.artist}}</td>\n                        <td>{{track.album}}</td>\n                        <td>{{track.time}}</td>\n                        <td class=\"icon\"><a ng-click=\"blockTrack(track)\"><i class=\"fi-prohibited\" ng-disabled=\"track.blocked\"></i></a></td>\n                    </tr>\n                </tbody>\n            </table>\n        </div>\n    </div>\n    <div id=\"energy-slider\" ng-class=\"{display:ready}\">\n        <h2>Energy <br/>Slider</h2>\n        <div class=\"switch\">\n            <input type=\"checkbox\" id=\"energy_checkbox\" ng-value=\"energy.status\" ng-click=\"energise()\" class=\"cmn-toggle cmn-toggle-round-flat\" ng-disabled=\"swappingTracks\">\n            <label for=\"energy_checkbox\"></label>\n        </div>\n        <div id=\"energy-slider-wrapper\">\n            <input type=\"range\" ng-model=\"energy.level\" min=\"1\" max=\"10\" ng-disabled=\"!energy.status\" ng-mouseup=\"changeEnergy()\" ng-touchend=\"changeEnergy()\">\n        </div>\n    </div>\n    <div id=\"overlay\" ng-class=\"{active:overlayActive}\" ng-controller=\"OverlayCtrl\">\n        <div ng-include=\"overlayTemplate\" class=\"overlay-wrapper clearfix\"></div>\n    </div>\n</div>");
$templateCache.put("playlists-ptp.html","<div ng-controller=\"OverlayLibraryPlaylistsCtrl\">\n    <div ng-repeat=\"playlist in venue.playlists\">\n        <div class=\"library-playlist\">\n            <a ng-click=\"!$root.ready || playPlaylist(playlist)\" ng-disabled=\"!$root.ready\"><i class=\"fi-play-circle\"></i></a>\n            <span class=\"library-playlist-info\">{{playlist.name}} - <em>{{playlist.tracks.length}} tracks</em></span>\n            <i class=\"fi-list-thumbnails\" ng-click=\"playlist.showTracks = !playlist.showTracks\"></i>\n        </div>\n        <table class=\"oeplayer-table\" ng-if=\"playlist.showTracks\">\n            <thead>\n                <tr>\n                    <th>{{lang.playlists.table.title}}</th>\n                    <th>{{lang.playlists.table.artist}}</th>\n                    <th>{{lang.playlists.table.album}}</th>\n                    <th>{{lang.playlists.table.block}}</th>\n                </tr>\n            </thead>\n            <tbody>\n                <tr ng-repeat=\"track in playlist.tracks\">\n                    <td>{{track.title}}</td>\n                    <td>{{track.artist}}</td>\n                    <td>{{track.album}}</td>\n                    <td class=\"icon\"><a ng-click=\"blockTrack(track)\"><i class=\"fi-prohibited\" ng-disabled=\"track.blocked\"></i></a></td>\n                </tr>\n            </tbody>\n        </table>\n    </div>\n</div>");
$templateCache.put("playlists-time.html","<div ng-controller=\"OverlayLibraryPlaylistsTimeCtrl\">\n    <div class=\"overlay-btn-group clearfix\">\n        <a ng-click=\"!$root.ready || playSchedule()\" ng-disabled=\"!$root.ready\">Press to start</a>\n    </div>\n    <div ng-repeat=\"playlist in playlists\">\n        <div class=\"library-playlist schedule-time\">\n            <span class=\"library-playlist-info\">{{playlist.name}} - <em>{{playlist.pivot.start}} to {{playlist.pivot.end}}</em></span>\n        </div>\n    </div>\n</div>");
$templateCache.put("schedule-box-inactive.html","<div \nstyle=\"height:{{height}}px;top:{{offset}}px\" \nclass=\"schedule-box schedule-box-inactive\" \n>\n<p>{{schedule.playlist.name}}</p>\n\n</div>");
$templateCache.put("schedule-box.html","<div \nstyle=\"height:{{height}}px;top:{{offset}}px\" \nclass=\"schedule-box energy-{{schedule.playlist.avg_energy}}\" \nng-class=\"{active:active,\'controls-left\':dayIndex == 6}\"\n>\n<p>{{schedule.playlist.name}}</p>\n	<div class=\"schedule-controls\" style=\"height:{{height}}px;\">\n\n		<div class=\"schedule-edit-controls\">\n			<a class=\"schedule-move-down\" ng-click=\"moveDown($event)\">\n				<span class=\"glyphicon glyphicon-chevron-down\" aria-hidden=\"true\"></span>\n			</a>\n			<div class=\"schedule-duration\">\n				<a ng-click=\"increaseLength($event)\">\n					<span class=\"glyphicon glyphicon-plus-sign\" aria-hidden=\"true\"></span>\n				</a>\n				<span>{{duration}}hrs</span>\n				<a ng-click=\"decreaseLength($event)\">\n					<span class=\"glyphicon glyphicon-minus-sign\" aria-hidden=\"true\"></span>\n				</a>\n				\n			</div>\n			<span class=\"triangle\"></span>\n			<div class=\"schedule-save\">\n				<a ng-click=\"save($event)\">\n					<span class=\"glyphicon glyphicon-ok-circle\" aria-hidden=\"true\"></span>\n				</a>\n				<a ng-click=\"cancel($event)\">\n					<span class=\"glyphicon glyphicon-ban-circle\" aria-hidden=\"true\"></span>\n				</a>\n				<a ng-click=\"delete($event)\" class=\"schedule-delete\">\n					<span class=\"glyphicon glyphicon-trash\" aria-hidden=\"true\"></span>\n				</a>\n			</div>\n\n			<a class=\"schedule-move-up\" ng-click=\"moveUp($event)\">\n				<span class=\"glyphicon glyphicon-chevron-up\" aria-hidden=\"true\"></span>\n			</a>\n		</div>\n	</div>\n</div>");
$templateCache.put("schedule-calendar.html"," <div ng-controller=\"OverlayScheduleCalendarCtrl\">\n\n	<div class=\"overlay-btn-group btn-group-2 clearfix\">\n		<a ng-click=\"calBack()\">\n			<i class=\"fi-arrow-left\"></i>\n		</a>\n		<a ng-click=\"calForward()\">\n			<i class=\"fi-arrow-right\"></i>\n		</a>\n	</div>\n	<div id=\"schedule-table\" class=\"schedule-table-calendar\">\n		<div class=\"schedule-header schedule-header-calendar clearfix\" sticky-headers-schedule>\n			<div>&nbsp;</div>\n			<div ng-repeat=\"day in schedules\" ng-class=\"{active:day.active}\">{{day.active?\'*\':\'\'}}{{day.date | amDateFormat:\'ddd Do MMM YYYY\'}}\n			</div>\n		</div>\n		<div class=\"schedule-overlay schedule-overlay-calendar\">\n			<div class=\"schedule-col-box clearfix\" ng-repeat=\"(dayIndex,day) in scheduleTemplate\">\n				<schedule-box-inactive \n				ng-repeat=\"schedule in day.schedule\"\n				day-index=\"dayIndex\"\n				schedule-index=\"$index\"\n				schedule=\"schedule\"\n				schedules=\"schedules\">\n				</schedule-box-inactive>\n			</div>\n		</div>\n		<div class=\"schedule-body\">\n			<div class=\"schedule-row-time clearfix\" ng-repeat=\"(indexTime,time) in times track by $index\">\n				<div>{{time | makeTime}}</div>\n				<span ng-if=\"$index > 0\">\n					<div \n					class=\"day-box\" \n					ng-init=\"hover\"\n					ng-class=\"{active: hover}\" \n    				ng-mouseenter=\"hover = true\"\n    				ng-mouseleave=\"hover = false\"\n    				ng-click=\"openModalGrid(time,$index,day.date)\"\n    				ng-repeat=\"day in schedules\">\n						<span class=\"glyphicon glyphicon-plus\" aria-hidden=\"true\"></span>				\n					</div>\n				</span>\n			</div>\n		</div>\n		<div class=\"schedule-overlay\">\n			<div class=\"schedule-col-box clearfix\" ng-repeat=\"(dayIndex,day) in schedules\">\n				<schedule-box \n				ng-repeat=\"schedule in day.schedule\"\n				day-index=\"dayIndex\"\n				schedule-index=\"$index\"\n				schedule=\"schedule\"\n				schedules=\"schedules\"\n				type=\"\'calendar\'\">\n				</schedule-box>\n			</div>\n		</div>\n	</div>\n</div>");
$templateCache.put("schedule-template.html"," <div ng-controller=\"OverlayScheduleTemplateCtrl\">\n	<div id=\"schedule-table\">\n		<div class=\"schedule-header clearfix\">\n			<div>&nbsp;</div>\n			<div>{{lang.schedule.days.mon}}</div>\n			<div>{{lang.schedule.days.tues}}</div>\n			<div>{{lang.schedule.days.wed}}</div>\n			<div>{{lang.schedule.days.thurs}}</div>\n			<div>{{lang.schedule.days.fri}}</div>\n			<div>{{lang.schedule.days.sat}}</div>\n			<div>{{lang.schedule.days.sun}}</div>\n		</div>\n		<div class=\"schedule-body\">\n			<div class=\"schedule-row-time clearfix\" ng-repeat=\"(indexTime,time) in times track by $index\">\n				<div>{{time | makeTime}}</div>\n				<span ng-if=\"$index > 0\">\n					<div \n					class=\"day-box\" \n					ng-init=\"hover\"\n					ng-class=\"{active: hover}\" \n    				ng-mouseenter=\"hover = true\"\n    				ng-mouseleave=\"hover = false\"\n    				ng-click=\"openModalGrid(time,$index)\"\n    				ng-repeat=\"i in [0,1,2,3,4,5,6]\">\n						<span class=\"glyphicon glyphicon-plus\" aria-hidden=\"true\"></span>				\n					</div>\n				</span>\n			</div>\n		</div>\n		<div class=\"schedule-overlay\">\n			<div class=\"schedule-col-box clearfix\" ng-repeat=\"(dayIndex,day) in schedules\">\n				<schedule-box \n				ng-repeat=\"schedule in day.schedule\"\n				day-index=\"dayIndex\"\n				schedule-index=\"$index\"\n				schedule=\"schedule\"\n				schedules=\"schedules\"\n				type=\"\'template\'\"\n				class=\"animated fadeIn\">\n				</schedule-box>\n			</div>\n		</div>\n	</div>\n</div>");}]);