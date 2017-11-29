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
          dest: 'assets/css',
          expand: true,
          flatten: true
        }, {
          // Fonts
          expand: true,
          src: [
            'bower_components/fontawesome/fonts/**'
          ],
          dest: 'assets/fonts',
          flatten: true,
          filter: 'isFile'
        }, {
          // Images
          src: [
            'bower_components/chosen-dist/chosen-sprite.png',
            'bower_components/chosen-dist/chosen-sprite@2x.png'
          ],
          dest: 'assets/images',
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
            'bower_components/modernizr/modernizr.js',
            'bower_components/underscore/underscore-min.js',
            'bower_components/underscore/underscore-min.map',
          ],
          dest: './lib',
          flatten: true
        }]
      },
      build: {
        files: [{
          cwd: 'js',
          src: ['**'],
          dest: 'release/js',
          expand: true
        }, {
          cwd: 'assets',
          src: ['**'],
          dest: 'release/assets',
          expand: true
        }, {
          cwd: 'lib',
          src: ['**'],
          dest: 'release/lib',
          expand: true
        }, {
          cwd: 'proxy',
          src: ['**'],
          dest: 'release/proxy',
          expand: true
        }, {
          src: 'index.html',
          dest: 'release',
          expand: true
        }]
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
          'assets/css/main.css': 'styles/main.scss'
        }
      },
      dist: {
        options: {
          style: 'compressed',
          noCache: true
        },
        files: {
          'assets/css/main.css': 'styles/main.scss'
        }
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'js/**/*.js',
        '!js/libs/**',
        '!js/components//**'
      ]
    },

    clean: ['dist'],

    shell: {
      bowerInstall: {
        command: 'bower install'
      }
    },

    watch: {
      css: {
        files: ['styles/*.scss',
            'js/components/smartmap-ui/src/styles/*.scss'],
        tasks: ['sass:dev']
      },
      js: {
        files: [
          'js/**/*.js',
          '!js/libs/**',
          '!js/components/smartmap-ui/**'
        ],
        tasks: ['jshint']
      }
    }
  });

  // Default task
  grunt.registerTask('default', ['sass:dev', 'jshint', 'watch']);

  // Other tasks
  grunt.registerTask('init', ['shell:bowerInstall', 'copy:bower', 'sass:dev', 'jshint', 'watch']);
  grunt.registerTask('travisinit', ['shell:bowerInstall', 'copy:bower', 'sass:dev', 'jshint']);

  grunt.registerTask('build', ['clean', 'sass:dist', 'copy:build']);
};
