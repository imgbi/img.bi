/*
 * This script can be used if you want to migrate db from old
 * python img.bi code to the new nodejs code.
 * It doesn't migrate ip limits, only file records.
*/
var cli = require('cli').enable('version');
var pkg = require('../package.json');
var async = require('async');
var redis = require('redis');
cli.setApp('imgbi-migrate', pkg.version);

cli.parse({
  redis: ['r', 'Redis instance URI', 'string', 'redis://127.0.0.1:6379']
});

cli.main(function(args, options) {
  if (!options.redis) {
    cli.fatal('See -h for help');
  }

  var client = require('redis').createClient(options.redis);
  client.batch()
    .keys('file:*')
    .keys('file:expire:*')
    .exec(function(err, keys) {
      cli.info('Starting migration');
      var multi = client.multi();
      async.parallel([
        function(callback) {
          async.each(keys[0], function(i, cb) {
            multi.rename(i, 'imgbi:' + i);
            cb(null);
          }, callback);
        },
        function(callback) {
          async.each(keys[1], function(i, cb) {
            client.get(i, function(err, reply) {
              if (err) {
                cb(err);
                return;
              }
              if (reply === null) {
                return;
              }
              var time = Date.parse(reply) / 1000;
              multi.zadd('imgbi:expire', time,
                i.replace('file:expire:', '');
              cb(null);
            });
          }, callback);
        }],
        function(err) {
          multi.exec(function(err) {
            if (err) {
              cli.fatal(err);
              return;
            }
            cli.ok('Done, without errors.');
          });
        });
    });
});
