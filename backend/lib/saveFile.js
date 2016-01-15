var fs = require('fs');
var Hashids = require('hashids');
var crypto = require('crypto');
var set = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
var base62 = require('base-x')(set);
var async = require('async');
var bcrypt = require('bcrypt');
var debug = require('debug')('saveFile.js');

module.exports = function(req, client, config) {
  return new Promise(function(resolve, reject) {
    var hashids = new Hashids(config.hashids);

    // We need to check if id exist because old version didn't use hashids
    new Promise(function(presolve, preject) {
      var getFileId = function() {
        client.incr('imgbi:next_file_id', function(err, reply) {
          if (err) {
            debug(err);
            preject('dbError');
            return;
          }
          var id = hashids.encode(reply);
          client.exists('imgbi:file:' + id, function(err, reply) {
            if (err) {
              debug(err);
              preject('dbError');
              return;
            }
            if (reply === 1) {
              getFileId();
            } else {
              presolve(id);
            }
          });
        });
      };
      getFileId();
    }).then(function(id) {
      async.parallel([
        function(callback) {
          fs.writeFile(config.uploadDir + '/' + id, req.body.encrypted,
            callback);
        },
        function(callback) {
          if (req.body.thumb) {
            fs.writeFile(config.uploadDir + '/thumb/' + id, req.body.thumb,
              callback);
          } else {
            callback(null);
          }
        },
        function(callback) {
          var multi = client.multi();
          if (req.body.expire && req.body.expire !== 0) {
            var time = Math.floor(
              (req.body.expire * 24 * 60 * 60) + (Date.now() / 1000)
            );
            multi.zadd('imgbi:expire', time, id);
          }
          crypto.randomBytes(40, function(ex, buf) {
            if (ex) {
              debug(ex);
              callback('passGenError');
              return;
            }

            var pass = base62.encode(buf);
            bcrypt.hash(pass, 10, function(err, hash) {
              if (err) {
                callback('hashGenError');
                return;
              }
              multi
                .set('imgbi:file:' + id, hash)
                .exec(function(err) {
                  if (err) {
                    debug(err);
                    callback('dbError');
                    return;
                  }
                  callback(null, {id: id, pass: pass, status: 'OK'});
                });
            });
          });
        }],
        function(err, replies) {
          if (err == 'dbError' || err == 'passGenError') {
            debug(err);
            reject(err);
          } else if (err) {
            debug(err);
            reject('failedToWrite');
          } else {
            resolve(replies[2]);
          }
        }
      );
    }, function(err) {
      debug(err);
      reject(err);
    });
  });
};
