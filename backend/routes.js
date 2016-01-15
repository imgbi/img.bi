var express = require('express');
var app = express();
var formidable = require('express-formidable');
var expressValidator = require('express-validator');
var validator = require('validator');
var compression = require('compression');
var debug = require('debug')('routes.js');

var checkLimitIp = require('./lib/checkLimitIp.js');
var checkEncrypted = require('./lib/checkEncrypted.js');
var checkThumb = require('./lib/checkThumb.js');
var saveFile = require('./lib/saveFile.js');
var removeFile = require('./lib/removeFile.js');
var getExpire = require('./lib/getExpire.js');

module.exports = function(client, config) {
  app.disable('x-powered-by');
  app.use(formidable.parse({
    maxFieldsSize: config.maxSize
  }));

  if (config.hostStatic === true) {
    app.use(express.static(config.staticContent));
    app.use('/download', express.static(config.uploadDir));
  }
  
  if (config.compress === true) {
    app.use(compression());
  }

  app.use(expressValidator({
    customValidators: {
      checkEncrypted: checkEncrypted,
      checkThumb: checkThumb,
      checkExpire: function(expire) {
        return !expire || validator.isInt(expire);
      }
    }
  }));

  app.post('/api/upload', function(req, res) {
    checkLimitIp(req, client, config).then(function() {
      req.checkBody('encrypted', 'invalidEncrypted').checkEncrypted();
      req.checkBody('thumb', 'invalidThumb').checkThumb();
      req.checkBody('expire', 'invalidExpire').checkExpire();

      req.asyncValidationErrors().then(function() {
        saveFile(req, client, config).then(function(data) {
          res.json(data);
        }, function(err) {
          res.status(500).json({err: err, status: 'error'});
        });
      }, function(errors) {
        res.status(400).json({err: errors[0].msg, status: 'error'});
      });
    }, function(err) {
      debug(err);
      if (err == 'ipLimit') {
        res.status(403).json({err: 'ipLimit', status: 'error'});
        return;
      } else {
        res.status(500).json({err: err, status: 'error'});
        return;
      }
    });
  });

  app.get('/api/remove', function(req, res) {
    req.check('id', 'invalidRequestId').isAlphanumeric();
    req.check('password', 'invalidRequestPass').isAlphanumeric();

    var errors = req.validationErrors();
    if (errors) {
      debug(errors);
      res.status(400).json({err: errors[0].msg, status: 'error'});
      return;
    }

    removeFile(req, client, config).then(function() {
      debug('File ' + req.query.id + ' was removed');
      res.json({status: 'OK'});
    }, function(err) {
      debug('Error during removing file ' + req.query.id);
      if (err == 'invalidPassword') {
        res.status(403).json({err: 'invalidPassword', status: 'error'});
        return;
      } else {
        res.status(500).json({err: err, status: 'error'});
        return;
      }
    });
  });

  app.post('/api/whenexpire', function(req, res) {
    req.check('id', 'invalidRequestId').isAlphanumeric();

    var errors = req.validationErrors();
    if (errors) {
      res.status(400).json({err: errors[0].msg, status: 'error'});
      return;
    }

    getExpire(req, client).then(function(data) {
      res.json({expire: data});
    }, function(err) {
      res.status(500).json({err: err, status: 'error'});
      return;
    });
  });

  app.listen(config.port, config.host);
};
