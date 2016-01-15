var async = require('async');
var debug = require('debug')('expire.js');
var rm = require('./rm.js');

module.exports = function(client, config) {
  var current = Date.now() / 1000;
  client.zrangebyscore('imgbi:expire', '-inf', current,
    function(err, reply) {
      async.each(reply, function(id, callback) {
        debug('File ' + id + ' was expired');
        rm(id, client, config).catch(function(err) {
          debug(err);
        });
      });
    }
  );
};
