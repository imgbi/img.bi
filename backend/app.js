var GulpRunner = require('gulp-runner');
var cluster = require('cluster');
var async = require('async');
var mkdirp = require('mkdirp');
var numCPUs = require('os').cpus().length;
var routes = require('./routes.js');
var redis = require('redis');

module.exports = function(config, callback) {
  if (cluster.isMaster) {
    var gulp = new GulpRunner(__dirname + '/../gulpfile.js');
    gulp.on('log', function(data) {
      callback(null, data.toString());
    });
    var gulpconfig = JSON.stringify(config);
    callback(null, 'Building static content');
    async.parallel([
      function(cb) {
        mkdirp(config.uploadDir + '/thumb', function (err) {
          cb(err, null);
        });
      },
      function(cb) {
        mkdirp(config.staticContent, function (err) {
          cb(err, null);
        });
      },
      function(cb) {
        gulp.run('build', {config: gulpconfig}, function(err) {
          cb(err, null);
        });
      }], function(err) {
        if (err) {
          callback(err);
          return;
        }

        callback(null, null, 'Static content was successfully built');

        setInterval(function() {
          expire(client, config);
        }, config.expireInterval);

        async.times(numCPUs, function(i, cb) {
          cluster.fork();
          cb(null);
        }, function() {
          callback(null, null, 'Running webserver on host ' + config.host +
          ' port ' + config.port);
      });
    });
  } else {
    var client = redis.createClient(config.redis);
    routes(client, config, callback);
  }
};
