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
            prodindex : {

                src : 'src/tmpl/index.html',
                dest : 'www/index.html',
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
            dolce:{
                files:[
                    {expand: true, src: ['dev/bower_components/**'], dest: 'whitelabel/dolce/'},
                    {expand: true, src: ['dev/ng/**'], dest: 'whitelabel/dolce/'},
                    {
                        expand: true,
                        src: [
                            'dev/assets/css/normalize.css',
                            'dev/assets/css/responsive.css',
                            'dev/assets/css/fonts/foundation-icons.css'
                        ],
                        dest: 'whitelabel/dolce/'
                    }
                ]
            },
            DD:{
                files:[
                    {expand: true, src: ['dev/bower_components/**'], dest: 'whitelabel/double-dutch/'},
                    {expand: true, src: ['dev/ng/**'], dest: 'whitelabel/double-dutch/'},
                    {
                        expand: true,
                        src: [
                            'dev/assets/css/normalize.css',
                            'dev/assets/css/responsive.css',
                            'dev/assets/css/fonts/foundation-icons.css'
                        ],
                        dest: 'whitelabel/double-dutch/'
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
                            'dev/assets/css/fonts/**',
                            'dev/assets/js/**'
                        ],
                        dest: 'whitelabel/punch/'
                    }
                ]
            },
            prodPunch:{
                files:[
                    {expand: true, src: ['www/bower_components/**'], dest: 'whitelabel/punch/'},
                    {expand: true, cwd:'www/assets/js/', src: ['**'], dest: 'whitelabel/punch/www/assets/js/'},
                    {expand: true, cwd:'whitelabel/punch/dev/assets/img',src: ['**'], dest: 'whitelabel/punch/www/assets/img/'},
                    {expand: true, cwd:'whitelabel/punch/dev/assets/css/fonts',src: ['**'], dest: 'whitelabel/punch/www/assets/css/fonts/'}
                ]
            },
            prodDolce:{
                files:[
                    {expand: true, src: ['www/bower_components/**'], dest: 'whitelabel/dolce/'},
                    {expand: true, cwd:'www/assets/js/', src: ['**'], dest: 'whitelabel/dolce/www/assets/js/'},
                    {expand: true, cwd:'whitelabel/dolce/dev/assets/js/', src: ['**'], dest: 'whitelabel/dolce/www/assets/js/'},
                    {expand: true, cwd:'whitelabel/dolce/dev/assets/img',src: ['**'], dest: 'whitelabel/dolce/www/assets/img/'},
                    {expand: true, cwd:'whitelabel/dolce/dev/assets/css',src: ['**'], dest: 'whitelabel/dolce/www/assets/css'},
                    {expand: true, cwd:'whitelabel/dolce/dev/assets/css/fonts',src: ['**'], dest: 'whitelabel/dolce/www/assets/css/fonts/'}
                ]
            },
            prodDD:{
                files:[
                    {expand: true, src: ['www/bower_components/**'], dest: 'whitelabel/double-dutch/'},
                    {expand: true, cwd:'www/assets/js/', src: ['**'], dest: 'whitelabel/double-dutch/www/assets/js/'},
                    {expand: true, cwd:'whitelabel/double-dutch/dev/assets/js/', src: ['**'], dest: 'whitelabel/double-dutch/www/assets/js/'},
                    {expand: true, cwd:'whitelabel/double-dutch/dev/assets/img',src: ['**'], dest: 'whitelabel/double-dutch/www/assets/img/'},
                    {expand: true, cwd:'whitelabel/double-dutch/dev/assets/css',src: ['**'], dest: 'whitelabel/double-dutch/www/assets/css'},
                    {expand: true, cwd:'whitelabel/double-dutch/dev/assets/css/fonts',src: ['**'], dest: 'whitelabel/double-dutch/www/assets/css/fonts/'}
                ]
            }
        },
        cssmin: {
            options: {
                shorthandCompacting: false,
                roundingPrecision: -1
            },
            prod: {
                files: {
                    'www/assets/css/<%= pkg.name %>.min.css': [
                        'dev/assets/css/normalize.css',
                        'dev/assets/css/main.css',
                        'dev/assets/css/responsive.css',
                        'dev/assets/css/fonts/foundation-icons.css'
                    ]
                }
            },
            prodPunch: {
                files: {
                    'whitelabel/punch/www/assets/css/<%= pkg.name %>.min.css': [
                        'whitelabel/punch/dev/assets/css/normalize.css',
                        'whitelabel/punch/dev/assets/css/main.css',
                        'whitelabel/punch/dev/assets/css/responsive.css',
                        'whitelabel/punch/dev/assets/css/fonts/foundation-icons.css'
                    ]
                }
            },
            prodDolce: {
                files: {
                    'whitelabel/dolce/www/assets/css/<%= pkg.name %>.min.css': [
                        'whitelabel/dolce/dev/assets/css/normalize.css',
                        'whitelabel/dolce/dev/assets/css/main.css',
                        'whitelabel/dolce/dev/assets/css/responsive.css',
                        'whitelabel/dolce/dev/assets/css/fonts/foundation-icons.css'
                    ]
                }
            },
            prodDD: {
                files: {
                    'whitelabel/double-dutch/www/assets/css/<%= pkg.name %>.min.css': [
                        'whitelabel/double-dutch/dev/assets/css/normalize.css',
                        'whitelabel/double-dutch/dev/assets/css/main.css',
                        'whitelabel/double-dutch/dev/assets/css/responsive.css',
                        'whitelabel/double-dutch/dev/assets/css/fonts/foundation-icons.css'
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
    grunt.registerTask('prod', [
        'env:prod',
        'preprocess:appjsprod',
        'preprocess:prodindex',
        //'preprocess:prodindexPunch',
        //'preprocess:prodindexDolce',
        //'preprocess:prodindexDD',
        'preprocess:cacheman',
        //'preprocess:cachemanPunch',
        //'preprocess:cachemanDolce',
        //'preprocess:cachemanDD',
        'concat',
        'uglify',
        'cssmin:prod',
        //'cssmin:prodPunch',
        //'cssmin:prodDolce',
        //'cssmin:prodDD',
        //'copy:prodDolce',
        //'copy:prodDD',
        //'copy:prodPunch'
    ]);
    grunt.registerTask('dev', [
        'env:dev',
        'preprocess:devindex',
        //'preprocess:devindexSecretlife',
        //'preprocess:devindexPunch',
        //'preprocess:devindexDolce',
        //'preprocess:devindexDD',
        'preprocess:appjs'
        //'copy:secretlife',
        //'copy:dolce',
        //'copy:DD',
        //'copy:punch'
    ]);

};
