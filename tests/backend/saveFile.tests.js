var expect = require('expect');
var redis = require('fakeredis');
var async = require('async');
var mock = require('mock-fs');
var fs = require('fs');
var bcrypt = require('bcrypt');
var saveFile = require('../../backend/lib/saveFile.js');
var client = redis.createClient('127.0.0.1', 1, {fast: true});

var req;
var config = {
  uploadDir: '/tmp'
};

mock({
  '/tmp/thumb': {}
});

beforeEach(function(done) {
  req = {
    body: {
      encrypted: 'a'
    }
  };
  async.parallel([
    function(callback) {
      client.flushdb(callback);
    },
    function(callback) {
      fs.mkdir('/tmp/thumb', callback);
    }
  ], function() {
      done();
    }
  );
});

describe('saveFile.js', function() {
  it('Should return data', function() {
    return saveFile(req, client, config).then(function(data) {
      expect(data.id).toBe('jR');
      expect(data.pass).toExist();
    });
  });

  it('Should save password to db', function(done) {
    saveFile(req, client, config).then(function(data) {
      client.get('imgbi:file:jR', function(err, reply) {
        bcrypt.compare(data.pass, reply, function(err, result) {
          expect(result).toBe(true);
          done();
        });
      });
    });
  });

  it('Should save generate new id if old one already exists', function(done) {
    client.set('imgbi:next_file_id', 1, function() {
      saveFile(req, client, config).then(function(data) {
        expect(data.id).toBe('k5');
        done();
      });
    });
  });

  it('Should save file', function(done) {
    saveFile(req, client, config).then(function(data) {
      fs.readFile('/tmp/jR', 'utf8', function(err, data) {
        expect(data).toBe('a');
        done();
      });
    });
  });

  it('Should save thumb', function(done) {
    req.body.thumb = 'b';
    saveFile(req, client, config).then(function(data) {
      fs.readFile('/tmp/thumb/jR', 'utf8', function(err, data) {
        expect(data).toBe('b');
        done();
      });
    });
  });

  it('Should set expire', function(done) {
    req.body.expire = 1;
    var time = Math.floor((24 * 60 * 60) + (Date.now() / 1000));
    saveFile(req, client, config).then(function(data) {
      client.zscore('imgbi:expire', 'jR', function(err, reply) {
        expect(reply).toBeGreaterThan(time - 1);
        expect(reply).toBeLessThan(time + 3);
        done();
      });
    });
  });

  it('Shouldn\'t set expire if it\'s 0', function(done) {
    req.body.expire = 0;
    var time = Math.floor((24 * 60 * 60) + (Date.now() / 1000));
    saveFile(req, client, config).then(function(data) {
      client.zscore('imgbi:expire', 'jR', function(err, reply) {
        expect(reply).toBe(null);
        done();
      });
    });
  });
});
