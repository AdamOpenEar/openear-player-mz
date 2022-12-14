angular.module('OEPlayer')
.factory('LangFactory',['SettingsSrvc',function(SettingsSrvc){
	var dictionary = {
		English:{
			menu:{
				playlists:'playlists',
				queue:'queue',
				schedule:'schedule',
				lastPlayed:'last played',
				settings:'settings',
				restart:'restart',
				logout:'logout',
        help:'FAQ',
        lock:'Lock',
				conflogout:'Are you sure you want to logoff?'
			},
			player:{
				online:'online',
				offline:'offline',
				lastplayed:{
					title:'Last Played',
					table:{
						title:'Title',
						album:'Album',
						artist:'Artist',
						block:'Block',
						played:'Played at'
					}
				}

			},
			playlists:{
				title:'Playlists',
				sub:{
					ptp:'Playlists',
					time:'Time Based',
          library:'From your library'
				},
				table:{
					title:'Title',
					album:'Album',
					artist:'Artist',
					block:'Block'
				}
			},
			queue:{
				title:'Queue',
				table:{
					title:'Title',
					album:'Album',
					artist:'Artist',
					block:'Block',
					energy:'Energy'
				}
			},
			lastPlayed:{
				title:'Last Played',
				table:{
					title:'Title',
					album:'Album',
					artist:'Artist',
					block:'Block',
					energy:'Energy'
				}
			},
			schedule:{
				title:'Schedule',
				sub:{
					template:'Week Template',
					cal:'Calendar'
				},
				days:{
					mon:'Monday',
					tues:'Tuesday',
					wed:'Wednesday',
					thurs:'Thursday',
					fri:'Friday',
					sat:'Saturday',
					sun:'Sunday'
				}
			},
			settings:{
				title:'Settings',
				language:'Language',
				fadein:'Fade time (seconds)',
				fadeout:'Fade out time (seconds)',
				skip:'Skip fade out time (seconds)',
				online:'Online check type',
				animations:'Animations',
				pushtoplay:'Push to play time (hours)',
				energy:'Energy slider minimum playlist length',
				energyTime:'Time to run energy slider (hours)',
				delstored:'Delete Stored Data',
				dellib:'Delete Library',
				conflibdel:'Are you sure you want to delete the library?',
				confstored:'Are you sure you want to delete stored data?',
				changeLang:'Changing language will require a restart. Are you sure?',
				restart:'24hr restart time'
			},
      help:{
        title:'FAQ'
      }
		},
		Portuguese:{
			menu:{
				playlists:'playlists',
				queue:'fila',
				schedule:'cronograma',
				lastPlayed:'last played',
				settings:'configura????es',
				restart:'reiniciar',
				logout:'sair',
				conflogout:'Tem certeza de que quer sair do site ?'
			},
			player:{
				online:'conectados',
				offline:'off-line',
				lastplayed:{
					title:'Tocada por ??ltimo',
					table:{
						title:'T??tulo',
						album:'??lbum',
						artist:'Artista',
						block:'Bloquear',
						played:'Tocado em'
					}
				}

			},
			playlists:{
				title:'Playlists',
				table:{
					title:'T??tulo',
					album:'??lbum',
					artist:'Artista',
					block:'Bloquear',
				}
			},
			queue:{
				title:'Fila',
				table:{
					title:'T??tulo',
					album:'??lbum',
					artist:'Artista',
					block:'Bloquear',
					energy:'Energia'
				}
			},
			lastPlayed:{
				title:'Last Played',
				table:{
					title:'Title',
					album:'Album',
					artist:'Artist',
					block:'Block',
					energy:'Energy'
				}
			},
			schedule:{
				title:'Cronograma',
				sub:{
					template:'Modelo Semanal',
					cal:'Calend??rio'
				},
				days:{
					mon:'Segunda',
					tues:'Ter??a',
					wed:'Quarta',
					thurs:'Quinta',
					fri:'Sexta',
					sat:'Sab??do',
					sun:'Domingo'
				}
			},
			settings:{
				title:'Configura????es',
				language:'Idioma',
				fadein:'Fade in (segundos)',
				fadeout:'Fade out (segundos)',
				skip:'Skip fade out tempo (segundos)',
				online:'Tipo de verifica????o on-line',
				animations:'Anima????es',
				pushtoplay:'Come??a a tocar as (horas)',
				energy:'Tamanho m??nimo da playlists do Slider de Energia',
				energyTime:'Time to run energy slider (hours)',
				delstored:'Excluir os dados armazenados',
				dellib:'excluir Biblioteca',
				conflibdel:'Tem certeza de que deseja excluir a biblioteca ?',
				confstored:'Tem certeza de que quer apagar os dados armazenados ?',
				changeLang:'Changing language will require a restart. Are you sure?',
				restart:'24hr restart time'
			}
		},
		Spanish:{
			menu:{
				playlists:'listas de reproducci??n',
				queue:'en espera',
				schedule:'horario',
				lastPlayed:'last played',
				settings:'preferencias',
				restart:'reiniciar',
				logout:'cerrar sesi??n',
				conflogout:'??Est?? seguro desea cerrar su sesi??n?'
			},
			player:{
				online:'en l??nea',
				offline:'sin conexi??n',
				lastplayed:{
					title:'Ultima Reproducci??n',
					table:{
						title:'T??tulo',
						album:'Album',
						artist:'Artista',
						block:'Bloquear',
						played:'Reproducida a las'
					}
				}

			},
			playlists:{
				title:'Listas de reproducci??n',
				table:{
					title:'T??tulo',
					album:'Album',
					artist:'Artista',
					block:'Bloquear',
				}
			},
			queue:{
				title:'En espera',
				table:{
					title:'T??tulo',
					album:'Album',
					artist:'Artista',
					block:'Bloquear',
					energy:'Energ??a'
				}
			},
			lastPlayed:{
				title:'Last Played',
				table:{
					title:'Title',
					album:'Album',
					artist:'Artist',
					block:'Block',
					energy:'Energy'
				}
			},
			schedule:{
				title:'Horario',
				sub:{
					template:'Plantilla Semanal',
					cal:'Calendario'
				},
				days:{
					mon:'Lunes',
					tues:'Martes',
					wed:'Mi??rcoles',
					thurs:'Jueves',
					fri:'Viernes',
					sat:'S??bado',
					sun:'Domingo'
				}
			},
			settings:{
				title:'Preferencias',
				language:'Idioma',
				fadein:'Tiempo de inicio gradual (segundos)',
				fadeout:'Tiempo de terminaci??n gradual (segundos)',
				skip:'Saltar tiempo de terminaci??n gradual (segundos)',
				online:'Checar tipo en l??nea',
				animations:'Animaciones',
				pushtoplay:'Oprimir para tiempo de reproducci??n (horas)',
				energy:'Energy slider minimum playlist length',
				energyTime:'Time to run energy slider (hours)',
				delstored:'Borrar Datos Almacenados',
				dellib:'Borrar Biblioteca',
				conflibdel:'??Est?? usted seguro que desea borrar la biblioteca?',
				confstored:'??Est?? usted seguro que desea borrar los datos almacenados?',
				changeLang:'Cambiar idioma requerir?? reinicio. ??Est?? seguro?',
				restart:'24hr restart time'
			}
		}
	};

	return dictionary[SettingsSrvc.lang];
}]);
