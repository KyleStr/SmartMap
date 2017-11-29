/*global module:false*/
module.exports = function(grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({

    copy: {
      bower: {
        files: [{
          // CSS
          src: [ /* Styles for components that do not support SCSS */ ],
          dest: 'src/assets/css',
          expand: true,
          flatten: true
        }, {
          // Fonts
          expand: true,
          src: [
            'bower_components/fontawesome/fonts/**'
          ],
          dest: 'src/assets/fonts',
          flatten: true,
          filter: 'isFile'
        }, {
          // Images
          src: [
            'bower_components/chosen-dist/chosen-sprite.png',
            'bower_components/chosen-dist/chosen-sprite@2x.png'
          ],
          dest: 'src/assets/images',
          expand: true,
          flatten: true
        }, {
          // Bower package JS libraries into 'lib'
          expand: true,
          src: [
            'bower_components/backbone/backbone.js',
            'bower_components/bootstrap-sass-twbs/assets/javascripts/bootstrap.js',
            'bower_components/chosen-dist/chosen.jquery.js',
            'bower_components/d3/d3.js',
            'bower_components/jquery/dist/jquery.min.js',
            'bower_components/jquery/dist/jquery.min.map',
            'bower_components/underscore/underscore-min.js',
            'bower_components/underscore/underscore-min.map',
            'bower_components/nouislider/distribute/jquery.nouislider.all.min.js',
            'bower_components/jquery-once/jquery.once.min.js',
          ],
          dest: 'src/lib',
          flatten: true
        }]
      },
      build: {
        files: [{
          cwd: 'src/js',
          src: ['**'],
          dest: 'release/js',
          expand: true
        }, {
          cwd: 'src/assets',
          src: ['**'],
          dest: 'release/assets',
          expand: true
        }, {
          src: ['src/lib/smartmap.js'],
          dest: 'release/lib/',
          expand: true,
          flatten: true
        }, {
          cwd: 'src/proxy',
          src: ['**'],
          dest: 'release/proxy',
          expand: true
        }, {
          src: 'src/smartmap-ui.js',
          dest: 'release/',
          expand: true,
          flatten: true
        }]
      }
    },

    concat: {
      options: {
        separator: grunt.util.linefeed + ';' + grunt.util.linefeed
      },
      dist: {
        files: {
          'release/lib/deps.js': [
            'bower_components/jquery/dist/jquery.min.js',
            'bower_components/underscore/underscore-min.js',
            'bower_components/backbone/backbone.js',
            'bower_components/bootstrap-sass-twbs/assets/javascripts/bootstrap.js',
            'bower_components/chosen-dist/chosen.jquery.js',
            'bower_components/d3/d3.js',
            'bower_components/nouislider/distribute/jquery.nouislider.all.min.js',
            'bower_components/jquery-once/jquery.once.min.js',
            'bower_components/perfect-scrollbar/min/perfect-scrollbar.min.js',
            'src/lib/dropdown.js',
            'src/lib/scrollable.js',
          ]
        }
      }
    },

    uglify: {
      deps: {
        files: {
          'release/lib/deps.min.js': ['release/lib/deps.js']
        }
      }
    },

    sass: {
      options: {
        compass: true
      },
      dev: {
        options: {
          lineNumbers: true,
          style: 'expanded',
          noCache: true
        },
        files: {
          'src/assets/css/main.css': 'src/styles/main.scss'
        }
      },
      dist: {
        options: {
          style: 'compressed',
          noCache: true
        },
        files: {
          'src/assets/css/main.css': 'src/styles/main.scss'
        }
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'src/js/**/*.js',
        '!src/js/libs/**'
      ]
    },

    clean: ['release'],

    shell: {
      bowerInstall: {
        command: 'bower install'
      }
    },

    watch: {
      css: {
        files: 'src/styles/*.scss',
        tasks: ['sass:dev']
      },
      js: {
        files: [
          'src/*.js',
          'src/js/**/*.js',
          '!src/js/libs/**'
        ],
        tasks: ['jshint', 'copy:build']
      },
      templates: {
        files: [
          'src/js/templates/*.html',
        ],
        tasks: ['copy:build']
      }
    }
  });

  // Default task
  grunt.registerTask('default', ['sass:dev', 'jshint', 'watch']);

  // Other tasks
  grunt.registerTask('init', ['shell:bowerInstall', 'copy:bower', 'sass:dev', 'jshint', 'watch']);
  grunt.registerTask('travisinit', ['shell:bowerInstall', 'copy:bower', 'sass:dev', 'jshint']);
  grunt.registerTask('build', ['clean', 'sass:dist', 'copy:build', 'concat', 'uglify']);
};
