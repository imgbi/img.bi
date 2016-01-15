var expect = require('expect');
var redis = require('fakeredis');
var client = redis.createClient('127.0.0.1', 7, {fast: true});
var mockery = require('mockery');
var sinon = require('sinon');
var spy = sinon.spy();
mockery.registerMock('./rm.js', function(id, client, config) {
  spy(id, client, config);
  return new Promise(function(resolve) {
    resolve();
  });
});
mockery.enable({
  warnOnReplace: false,
  warnOnUnregistered: false
});
var expire = require('../../backend/lib/expire.js');

var config = {
  uploadDir: '/tmp'
};

beforeEach(function(done) {
  client.zadd('imgbi:expire', 1, 'a', function() {
    done();
  });
});

describe('expire.js', function() {
  it('Should pass expired files to rm()', function(done) {
    expire(client, config);
    setTimeout(function() {
      expect(spy.calledWith('a', client, config)).toBe(true);
      done();
    }, 10);
  });
});
