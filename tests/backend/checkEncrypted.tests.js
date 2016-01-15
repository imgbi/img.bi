var expect = require('expect');
var checkEncrypted = require('../../backend/lib/checkEncrypted.js');

describe('checkEncrypted.js', function() {
  it('Should reject anything that are not JSON', function(done) {
    checkEncrypted('a').catch(function(err) {
      expect(err).toBe('notJSON');
      done();
    });
  });

  it('Should invalid JSON', function(done) {
    checkEncrypted('{"a": "b"}').catch(function(err) {
      expect(err).toBe('invalidJSON');
      done();
    });
  });

  it('Should resolve valid JSON', function(done) {
    checkEncrypted('{"iv": "b"}').then(function() {
      done();
    });
  });
});
