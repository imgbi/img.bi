var expect = require('expect');
var redis = require('fakeredis');
var bcrypt = require('bcrypt');
var sinon = require('sinon');
var mockery = require('mockery');
var spy = sinon.spy();
var shouldResolve = true;
mockery.registerMock('./rm.js', function(id, client, config) {
  spy(id, client, config);
  return new Promise(function(resolve, reject) {
    if (shouldResolve) {
      resolve();
    } else {
      reject('err');
    }
  });
});
mockery.enable({
  warnOnReplace: false,
  warnOnUnregistered: false
});
var removeFile = require('../../backend/lib/removeFile.js');
var client = redis.createClient('127.0.0.1', 3, {fast: true});

var req;
var config = {
  uploadDir: '/tmp'
};

beforeEach(function(done) {
  req = {
    query: {
      id: 'a',
      password: 'a'
    }
  };
  client.flushdb(function() {
    done();
  });
});

describe('removeFile.js', function() {
  it('Should return error when no such file in db', function(done) {
    removeFile(req, client, config).catch(function(err) {
      expect(err).toBe('noFile');
      done();
    });
  });

  it('Should return error when password is incorrect', function(done) {
    client.set('imgbi:file:a',
      '$2a$10$Vwp0vqBLCImbbSdXPWSEZuQ8mpYi2Y752pfElmcCiJGVjJHm08gMG',
      function() {
        removeFile(req, client, config).catch(function(err) {
          expect(err).toBe('incorrectPassword');
          done();
        });
      }
    );
  });

  it('Should call rm() when everything is OK', function(done) {
    client.set('imgbi:file:a',
      '$2a$10$cJK9aTgnvdO42imFDHWIQ.FfMBI4hobvcsIBagihbVZPBL/knRHRm',
      function() {
        removeFile(req, client, config).then(function() {
          expect(spy.calledWith('a', client, config)).toBe(true);
          done();
        });
      }
    );
  });

  it('Should return error from rm()', function(done) {
    shouldResolve = false;
    client.set('imgbi:file:a',
      '$2a$10$cJK9aTgnvdO42imFDHWIQ.FfMBI4hobvcsIBagihbVZPBL/knRHRm',
      function() {
        removeFile(req, client, config).catch(function(err) {
          expect(err).toBe('err');
          done();
        });
      }
    );
  });
});
