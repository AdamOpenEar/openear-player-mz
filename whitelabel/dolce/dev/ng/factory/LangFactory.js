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
				settings:'configurações',
				restart:'reiniciar',
				logout:'sair',
				conflogout:'Tem certeza de que quer sair do site ?'
			},
			player:{
				online:'conectados',
				offline:'off-line',
				lastplayed:{
					title:'Tocada por último',
					table:{
						title:'Título',
						album:'Álbum',
						artist:'Artista',
						block:'Bloquear',
						played:'Tocado em'
					}
				}

			},
			playlists:{
				title:'Playlists',
				table:{
					title:'Título',
					album:'Álbum',
					artist:'Artista',
					block:'Bloquear',
				}
			},
			queue:{
				title:'Fila',
				table:{
					title:'Título',
					album:'Álbum',
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
					cal:'Calendário'
				},
				days:{
					mon:'Segunda',
					tues:'Terça',
					wed:'Quarta',
					thurs:'Quinta',
					fri:'Sexta',
					sat:'Sabádo',
					sun:'Domingo'
				}
			},
			settings:{
				title:'Configurações',
				language:'Idioma',
				fadein:'Fade in (segundos)',
				fadeout:'Fade out (segundos)',
				skip:'Skip fade out tempo (segundos)',
				online:'Tipo de verificação on-line',
				animations:'Animações',
				pushtoplay:'Começa a tocar as (horas)',
				energy:'Tamanho mínimo da playlists do Slider de Energia',
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
				playlists:'listas de reproducción',
				queue:'en espera',
				schedule:'horario',
				lastPlayed:'last played',
				settings:'preferencias',
				restart:'reiniciar',
				logout:'cerrar sesión',
				conflogout:'¿Está seguro desea cerrar su sesión?'
			},
			player:{
				online:'en línea',
				offline:'sin conexión',
				lastplayed:{
					title:'Ultima Reproducción',
					table:{
						title:'Título',
						album:'Album',
						artist:'Artista',
						block:'Bloquear',
						played:'Reproducida a las'
					}
				}

			},
			playlists:{
				title:'Listas de reproducción',
				table:{
					title:'Título',
					album:'Album',
					artist:'Artista',
					block:'Bloquear',
				}
			},
			queue:{
				title:'En espera',
				table:{
					title:'Título',
					album:'Album',
					artist:'Artista',
					block:'Bloquear',
					energy:'Energía'
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
					wed:'Miércoles',
					thurs:'Jueves',
					fri:'Viernes',
					sat:'Sábado',
					sun:'Domingo'
				}
			},
			settings:{
				title:'Preferencias',
				language:'Idioma',
				fadein:'Tiempo de inicio gradual (segundos)',
				fadeout:'Tiempo de terminación gradual (segundos)',
				skip:'Saltar tiempo de terminación gradual (segundos)',
				online:'Checar tipo en línea',
				animations:'Animaciones',
				pushtoplay:'Oprimir para tiempo de reproducción (horas)',
				energy:'Energy slider minimum playlist length',
				energyTime:'Time to run energy slider (hours)',
				delstored:'Borrar Datos Almacenados',
				dellib:'Borrar Biblioteca',
				conflibdel:'¿Está usted seguro que desea borrar la biblioteca?',
				confstored:'¿Está usted seguro que desea borrar los datos almacenados?',
				changeLang:'Cambiar idioma requerirá reinicio. ¿Está seguro?',
				restart:'24hr restart time'
			}
		}
	};

	return dictionary[SettingsSrvc.lang];
}]);
