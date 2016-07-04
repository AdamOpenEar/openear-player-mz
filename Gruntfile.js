module.exports = function(grunt) {
    // Project configuration.
    var now = new Date().getTime();

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        env:{
            dev:{
                NODE_ENV : 'DEVELOPMENT'
            },
            prod:{
                NODE_ENV : 'PRODUCTION'
            }
        },
        preprocess:{
            devindex : {
                src : 'src/tmpl/index.html',
                dest : 'dev/index.html',
                options : {
                    context : {
                        name : '<%= pkg.name %>',
                        version : '<%= pkg.version %>',
                        now : now,
                        ver : '<%= ver %>',
                        company: 'OpenEar Player'
                    }
                }
            },
            devindexSecretlife : {

                src : 'src/tmpl/index.html',
                dest : 'whitelabel/secretlife/dev/index.html',
                options : {
                    context : {
                        name : '<%= pkg.name %>',
                        version : '<%= pkg.version %>',
                        now : now,
                        ver : '<%= ver %>',
                        company: 'Secret Life - Powered by OpenEar Player'
                    }
                }

            },
            devindexPunch : {

                src : 'src/tmpl/index.html',
                dest : 'whitelabel/punch/dev/index.html',
                options : {
                    context : {
                        name : '<%= pkg.name %>',
                        version : '<%= pkg.version %>',
                        now : now,
                        ver : '<%= ver %>',
                        company: 'Punch Taverns - Powered by OpenEar Player'
                    }
                }

            },
            prodindex : {

                src : 'src/tmpl/index.html',
                dest : 'www/index.html',
                options : {

                    context : {
                        name : '<%= pkg.name %>',
                        version : '<%= pkg.version %>',
                        now : now,
                        ver : '<%= ver %>'
                    }

                }

            },
            cacheman :{
                src : 'src/tmpl/cache.manifest',
                dest : 'www/cache.manifest',
                options : {

                    context : {
                        name : '<%= pkg.name %>',
                        version : '<%= pkg.version %>',
                        now : now,
                        ver : '<%= ver %>'
                    }

                }                
            },
            appjs :{
                src : 'src/tmpl/app.js',
                dest : 'dev/ng/app.js',
                options : {

                    context : {
                        name : '<%= pkg.name %>',
                        version : '<%= pkg.version %>',
                        now : now,
                        ver : '<%= ver %>',
                    }

                }                
            },
            appjsprod :{
                src : 'src/tmpl/app.js',
                dest : 'src/build/app.js',
                options : {

                    context : {
                        name : '<%= pkg.name %>',
                        version : '<%= pkg.version %>',
                        now : now,
                        ver : '<%= ver %>',
                    }

                }                
            }

        },
        concat: {
            options: {
                // define a string to put between each file in the
                // concatenated output
                separator: ';'
            },
            dist: {
                // the files to concatenate
                src: [
                    'src/build/app.js',
                    'dev/ng/**/*.js',
                    'dev/ng/*.js',
                    '!dev/ng/template.js',
                    '!dev/ng/app.js',
                ],
                // the location of the resulting JS file
                dest: 'src/build/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                beautify: false,
                mangle: false
            },
            build: {
                src: 'src/build/<%= pkg.name %>.js',
                dest: 'www/assets/js/<%= pkg.name %>.min.js'
            }
        },
        concat_css: {
            options: {},
            all: {
                dest:'www/assets/css/<%= pkg.name %>.css',
                src:[
                    'dev/assets/css/normalize.css',
                    'dev/assets/css/main.css',
                    'dev/assets/css/responsive.css',
                    'dev/assets/css/fonts/foundation-icons.css'
                ]
            }
        },
        copy:{
            prod:{
                files:[
                    {expand: true, src: ['dev/bower_components/*'], dest: 'www/bower_components/', filter: 'isFile'}
                ]
            },
            secretlife:{
                files:[
                    {expand: true, src: ['dev/bower_components/**'], dest: 'whitelabel/secretlife/'},
                    {expand: true, src: ['dev/ng/**'], dest: 'whitelabel/secretlife/'},
                    {
                        expand: true,
                        src: [
                            'dev/assets/css/normalize.css',
                            'dev/assets/css/responsive.css',
                            'dev/assets/css/fonts/foundation-icons.css',
                            'dev/assets/js/**'
                        ],
                        dest: 'whitelabel/secretlife/'
                    }
                ]
            },
            punch:{
                files:[
                    {expand: true, src: ['dev/bower_components/**'], dest: 'whitelabel/punch/'},
                    {expand: true, src: ['dev/ng/**'], dest: 'whitelabel/punch/'},
                    {
                        expand: true,
                        src: [
                            'dev/assets/css/normalize.css',
                            'dev/assets/css/responsive.css',
                            'dev/assets/css/main.css',
                            'dev/assets/css/fonts/foundation-icons.css',
                            'dev/assets/js/**'
                        ],
                        dest: 'whitelabel/punch/'
                    }
                ]
            }
        },
        cssmin: {
            options: {
                shorthandCompacting: false,
                roundingPrecision: -1
            },
            target: {
                files: {
                    'www/assets/css/<%= pkg.name %>.min.css': [
                        'dev/assets/css/normalize.css',
                        'dev/assets/css/main.css',
                        'dev/assets/css/responsive.css',
                        'dev/assets/css/fonts/foundation-icons.css'
                    ]
                }
            }
        }
    })
    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-concat-css');
    grunt.loadNpmTasks('grunt-preprocess');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-ng-annotate');
    // Default task(s).
    grunt.registerTask('prod', ['env:prod', 'preprocess:appjsprod','preprocess:prodindex','preprocess:cacheman','concat', 'uglify','cssmin']);
    grunt.registerTask('dev', [
        'env:dev',
        'preprocess:devindex',
        'preprocess:devindexSecretlife',
        'preprocess:devindexPunch',
        'preprocess:appjs',
        'copy:secretlife'
        'copy:punch'
    ]);

};