var bcrypt = require('bcrypt');
var debug = require('debug')('removeFile.js');
var rm = require('./rm.js');

module.exports = function(req, client, config) {
  return new Promise(function(resolve, reject) {
    client.get('imgbi:file:' + req.query.id, function(err, reply) {
      if (err) {
        debug(err);
        reject('dbError');
        return;
      }

      if (reply === null) {
        debug('No file ' + req.query.id);
        reject('noFile');
        return;
      }

      bcrypt.compare(req.query.password, reply, function(err, result) {
        if (err) {
          debug(err);
          reject('serverError');
          return;
        }

        if (result === true) {
          rm(req.query.id, client, config).then(function() {
            resolve();
          }).catch(function(err) {
            reject(err);
          });
        } else {
          reject('incorrectPassword');
        }
      });
    });
  });
};
