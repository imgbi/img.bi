angular.module('imgbi.webservices', [])
  .factory('downloadFile', ['$q', '$http', function($q, $http) {
    return function(id) {
      var deferred = $q.defer();
      $http({
        method: 'GET',
        url: '/download/' + id
      })
      .success(function(data) {
        deferred.resolve(JSON.stringify(data));
      })
      .error(function(err, status) {
        deferred.reject({text: err, status: status});
      });
      return deferred.promise;
    };
  }])
  .factory('downloadThumb', [
    '$q', '$http', 'rmStorage',
    function($q, $http, rmStorage) {
      return function(id) {
        var deferred = $q.defer();
        $http({
          method: 'GET',
          url: '/download/thumb/' + id
        })
        .success(function(data) {
          deferred.resolve(JSON.stringify(data));
        })
        .error(function(err, status) {
          if (status === 404) {
            rmStorage(id);
          }
          deferred.reject(err);
        });
        return deferred.promise;
      };
    }
  ])
  .factory('removeFile', [
    '$q', '$http', 'rmStorage',
    function($q, $http, rmStorage) {
      return function(id, rmpass) {
        var deferred = $q.defer();
        $http({
          method: 'GET',
          url: '/api/remove',
          params: {id: id, password: rmpass}
        })
        .success(function(data) {
          if (data.status == 'OK') {
            rmStorage(id);
            deferred.resolve(true);
          } else {
            deferred.reject(data.err);
          }
        })
        .error(function(err) {
          deferred.reject(err);
        });
        return deferred.promise;
      };
    }
  ])
  .factory('uploadFile', ['$q', '$http',
    function($q, $http) {
      return function(ethumb, encrypted, expire) {
        var deferred = $q.defer();
        var fd = new FormData();
        fd.append('encrypted', encrypted);
        fd.append('thumb', ethumb);
        fd.append('expire', expire);
        $http.post('/api/upload', fd, {
          transformRequest: angular.identity,
          headers: {'Content-Type': undefined}
        })
        .success(function(data) {
          if (data.status == 'OK') {
            deferred.resolve({
              id: data.id,
              rmpass: data.pass
            });
          } else {
            deferred.reject(data.err);
          }
        })
        .error(function(err) {
          deferred.reject(err);
        });
        return deferred.promise;
      };
    }
  ]);
