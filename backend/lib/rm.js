var async = require('async');
var fs = require('fs');

module.exports = function(id, client, config) {
  return new Promise(function(resolve, reject) {
    async.parallel([
      function(callback) {
        fs.unlink(config.uploadDir + '/' + id,
          function(err) {
            if ((err && err.code && err.code === 'ENOENT') || !err) {
              callback(null);
            } else {
              callback('failedToRemove');
            }
          }
        );
      },
      function(callback) {
        fs.unlink(config.uploadDir + '/thumb/' + id,
          function(err) {
            if ((err && err.code && err.code === 'ENOENT') || !err) {
              callback(null);
            } else {
              callback('failedToRemove');
            }
          }
        );
      },
      function(callback) {
        client.del('imgbi:file:' + id, function(err) {
          if (err) {
            callback('dbError');
            return;
          }
          callback(null);
        });
      }
    ],
    function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
};
