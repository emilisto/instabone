'use strict';

module.exports = function (grunt) {
  // load all grunt tasks

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    config: {
      browserify: 'node node_modules/browserify/bin/cmd.js'
    },

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

    shell: {
      browserify: {
        command: '<%= config.browserify %> -s Instabone -r ./index -o ./build/instabone.js'
      }
    }

  });

  grunt.registerTask('postBuildMessage', function() {
    grunt.log.ok('');
    grunt.log.ok('BUILT! To test it in the browser right away, do `grunt browsertest`. Enjoy.');
    grunt.log.ok('');
  });

  grunt.registerTask('build', [
    'shell:browserify',
    'postBuildMessage'
  ]);
  grunt.registerTask('browsertest', [
    'build',
    'open',
    'connect:default:keepalive',
  ]);

};

function mountFolder(connect, dir) {
  return connect.static(require('path').resolve(dir));
};
