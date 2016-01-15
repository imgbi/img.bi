module.exports = function(encrypted) {
  return new Promise(function(resolve, reject) {
    var enc;
    try {
      enc = JSON.parse(encrypted);
    } catch (e) {
      reject('notJSON');
    }
    if ('iv' in enc) {
      resolve();
    } else {
      reject('invalidJSON');
    }
  });
};
