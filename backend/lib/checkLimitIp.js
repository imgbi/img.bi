var async = require('async');
var bcrypt = require('bcrypt');

module.exports = function(req, client, config) {
  return new Promise(function(resolve, reject) {
    var hostname = req.hostname;
    var ip = req.connection.remoteAddress;

    // We need to limit Tor and I2P differently
    if (/\.(onion|i2p)$/.test(hostname)) {
      client.get('imgbi:hiddenuploads', function(err, reply) {
        if (err) {
          reject('dbError');
          return;
        }
        if (reply === null) {
          client.multi()
            .set('imgbi:hiddenuploads', 1)
            .expire('imgbi:hiddenuploads', 86400)
            .exec(function(err) {
              if (err) {
                reject('dbError');
                return;
              }
              resolve();
            });
        }
        if (reply > config.hiddenLimit) {
          reject('hiddenLimit');
          return;
        }
        client.incr('imgbi:hiddenuploads', function(err) {
          if (err) {
            reject('dbError');
            return;
          }
          resolve();
        });
      });
    } else {
      async.waterfall([
        function(callback) {
          client.get('imgbi:ipsalt', function(err, reply) {
            if (err) {
              callback('dbError');
              return;
            }
            callback(null, reply);
          });
        },
        function(reply, callback) {
          if (reply === null) {
            bcrypt.genSalt(10, function(err, salt) {
              if (err) {
                callback('serverError');
                return;
              }
              client.multi()
                .set('imgbi:ipsalt', salt)
                .expire('imgbi:ipsalt', 86400)
                .exec(function(err) {
                  if (err) {
                    callback('dbError');
                    return;
                  }
                  callback(null, salt);
                });
            });
          } else {
            callback(null, reply);
          }
        },
        function(salt, callback) {
          bcrypt.hash(ip, salt, function(err, hash) {
            if (err) {
              callback('serverError');
              return;
            }
            client.get('imgbi:uploads:' + hash, function(err, reply) {
              if (reply > config.ipLimit) {
                callback('ipLimit');
              } else {
                client.multi()
                  .incr('imgbi:uploads:' + hash)
                  .ttl('imgbi:uploads:' + hash)
                  .exec(function(err, replies) {
                    if (err) {
                      callback('dbError');
                      return;
                    }
                    if (replies[1] == -1) {
                      client.expire('imgbi:uploads:' + hash, 86400,
                        function(err, reply) {
                          if (err) {
                            callback('dbError');
                            return;
                          }
                          callback(null);
                        }
                      );
                    } else {
                      callback(null);
                    }
                  });
              }
            });
          });
        }],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
    }
  });
};
