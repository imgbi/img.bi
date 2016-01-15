var expect = require('expect');
var checkLimitIp = require('../../backend/lib/checkLimitIp.js');
var redis = require('fakeredis');
var client = redis.createClient('127.0.0.1', 2, {fast: true});

var config = {
  ipLimit: 100,
  hiddenLimit: 2000
};
var req;
beforeEach(function(done) {
  req = {
    hostname: 'img.bi',
    connection: {
      remoteAddress: '127.0.0.1'
    }
  };
  client.multi()
    .flushdb()
    .set('imgbi:ipsalt', '$2a$04$BjPykupo9UOTLldPkZULwu')
    .exec(function() {
      done();
    });
});

describe('checkLimitIp.js', function() {
  it('Should resolve if there is not to much uploads', function() {
    return checkLimitIp(req, client, config);
  });

  it('Should resolve if there is not to much uploads to hidden service',
    function() {
      req.hostname = 'imgbi.i2p';
      return checkLimitIp(req, client, config);
    }
  );

  it('Should be rejected if there is too much uploads', function(done) {
    // jscs:disable maximumLineLength
    var db = 'imgbi:uploads:$2a$04$BjPykupo9UOTLldPkZULwuHLSnbBQsuMDv9mbUYUKxRZcxfkIveLS';
    // jscs:enable
    client.set(db, 999, function() {
      checkLimitIp(req, client, config).catch(function(err) {
        expect(err).toBe('ipLimit');
        done();
      });
    });
  });

  it('Should be rejected if there is too much uploads to hidden service',
    function(done) {
      req.hostname = 'imgbi.i2p';
      client.set('imgbi:hiddenuploads', 9999, function() {
        checkLimitIp(req, client, config).catch(function(err) {
          expect(err).toBe('hiddenLimit');
          done();
        });
      });
    }
  );
});
