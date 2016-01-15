module.exports = function(req, client) {
  return new Promise(function(resolve, reject) {
    client.get('imgbi:file:' + req.query.id, function(err, reply) {
      if (err) {
        reject('dbError');
        return;
      }
      if (reply === null) {
        reject('noFile');
        return;
      }
      client.zscore('imgbi:expire', req.query.id, function(err, score) {
        if (err) {
          reject('dbError');
          return;
        }
        resolve(score | 0);
      });
    });
  });
};
