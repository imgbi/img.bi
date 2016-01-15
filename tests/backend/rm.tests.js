var expect = require('expect');
var redis = require('fakeredis');
var client = redis.createClient('127.0.0.1', 6, {fast: true});
var mock = require('mock-fs');
var fs = require('fs');
var rm = require('../../backend/lib/rm.js');
var config = {
  uploadDir: '/tmp'
};

beforeEach(function(done) {
  mock({
    '/tmp/a': 'a',
    '/tmp/thumb': {
       a: 'b'
     }
  });
  client.set('imgbi:file:a', 'a', function() {
    done();
  });
});

describe('rm.js', function() {
  it('Should remove file', function(done) {
    rm('a', client, config).then(function() {
      fs.stat('/tmp/a', function(err, stat) {
        expect(stat).toBe(undefined);
        done();
      });
    });
  });

  it('Should remove thumb', function(done) {
    rm('a', client, config).then(function() {
      fs.stat('/tmp/thumb/a', function(err, stat) {
        expect(stat).toBe(undefined);
        done();
      });
    });
  });

  it('Should remove entry from db', function(done) {
    rm('a', client, config).then(function() {
      client.exists('imgbi:file:a', function(err, r) {
        expect(r).toBe(0);
        done();
      });
    });
  });

  it('Should work with already removed file', function(done) {
    fs.unlink('/tmp/a', function() {
      rm('a', client, config).then(function() {
        done();
      });
    });
  });

  it('Should work with already removed thumb', function(done) {
    fs.unlink('/tmp/thumb/a', function() {
      rm('a', client, config).then(function() {
        done();
      });
    });
  });
});
