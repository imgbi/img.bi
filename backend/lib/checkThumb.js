var checkEncrypted = require('./checkEncrypted.js');

module.exports = function(thumb) {
  return new Promise(function(resolve, reject) {
    if (thumb) {
      resolve(checkEncrypted(thumb));
    } else {
      resolve();
    }
  });
};
