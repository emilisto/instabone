'use strict';

module.exports = function (grunt) {
  // load all grunt tasks

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    connect: {
      options: {
        port: 1234,
        hostname: '0.0.0.0'
      },
      default: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, 'build'),
              mountFolder(connect, 'browsertest'),
            ];
          }
        }
      }
    },
    open: {
      server: {
        path: 'http://localhost:<%= connect.options.port %>'
      }
    },

    browserify: {
      files: {
        'build/instabone.js': [ './index.js' ]
      }
    }

  });

  grunt.registerTask('build', []);
  grunt.registerTask('browsertest', [
    'build',
    'open',
    'connect:default:keepalive',
  ]);

};

function mountFolder(connect, dir) {
  return connect.static(require('path').resolve(dir));
};
