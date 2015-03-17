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
  .factory('downloadThumb', ['$q', '$http', 'rmStorage', function($q, $http, rmStorage) {
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
  }])
  .factory('removeFile', ['$q', '$http', 'rmStorage', function($q, $http, rmStorage) {
    return function(id, rmpass) {
      var deferred = $q.defer();
      $http({
        method: 'GET',
        url: '/api/remove',
        params: {id: id, password: rmpass}
      })
      .success(function(data) {
        if (data.status == 'Success') {
          rmStorage(id);
          deferred.resolve(true);
        }
        else {
          deferred.reject(data.status);
        }
      })
      .error(function(err) {
        deferred.reject(err);
      });
      return deferred.promise;
    };
  }])
  .factory('uploadFile', ['$q', '$http', 'param', function($q, $http, param) {
    return function(ethumb, encrypted, expire) {
      var deferred = $q.defer();
      $http({
        method: 'POST',
        url: '/api/upload',
        data: param({thumb: ethumb, encrypted: encrypted, expire: expire}),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      })
      .success(function(data) {
        if(data.status == 'OK') {
          deferred.resolve({
            id: data.id,
            rmpass: data.pass
          });
        }
      })
      .error(function(err) {
        deferred.reject(err);
      });
      return deferred.promise;
    };
  }]);
