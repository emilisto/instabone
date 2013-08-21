'use strict';

var crypto = require('crypto'),
    fs = require('fs'),
    connect = require('connect'),
    _ = require('underscore'),
    https = require('https');

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
      }
    },
    open: {
      server: {
        path: 'http://localhost:<%= connect.options.port %>'
      }
    },

    shell: {
      browserify: {
        command: '<%= config.browserify %> -s Instabone -r ./index.browser -o ./build/instabone.js'
      }
    }

  });

  grunt.registerTask('postBuildMessage', function() {
    grunt.log.ok('');
    grunt.log.ok('BUILT! To test it in the browser right away, do `grunt browsertest`. Enjoy.');
    grunt.log.ok('');
  });

  grunt.registerTask('connect', function() {
    var options = _.defaults(grunt.config('connect.options'), {
      hostname: 'localhost',
      port: 1234
    });

    // Load SSL credentials
    var sslOptions = {
      key: fs.readFileSync('ssl/privatekey.pem').toString(),
      cert: fs.readFileSync('ssl/certificate.pem').toString()
    };

    var app = connect()
      .use(mountFolder(connect, 'build'))
      .use(mountFolder(connect, 'browsertest'));

    https.createServer(sslOptions, app)
      .listen(options.port, options.hostname)
      .on('listening', function() {
        grunt.log.writeln('Started connect web server on ' + options.hostname + ':' + options.port + '.');
      });

    this.async();

  });

  grunt.registerTask('build', [
    'shell:browserify',
    'postBuildMessage'
  ]);

  grunt.registerTask('browsertest', [
    'build',
    'open',
    'connect',
  ]);

};

function mountFolder(connect, dir) {
  return connect.static(require('path').resolve(dir));
};
