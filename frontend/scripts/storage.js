angular.module('imgbi.storage', [])
  .factory('rmStorage', [function() {
    return function(id) {
      localStorage.removeItem('imgbi_' + id);
    };
  }])
  .factory('setStorage', [function() {
    return function(id, value) {
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
      localStorage.setItem('imgbi_' + id, value);
    };
  }])
  .factory('getStorage', ['$q', function($q) {
    return function(id) {
      var deferred = $q.defer();
      if (id != 'lang' && id != 'expire') {
        deferred.resolve(JSON.parse(localStorage.getItem('imgbi_' + id)));
      } else {
        deferred.resolve(localStorage.getItem('imgbi_' + id));
      }
      return deferred.promise;
    };
  }])
  .factory('getFullStorage', ['$q', function($q) {
    return function(id) {
      var deferred = $q.defer();
      deferred.resolve(localStorage);
      return deferred.promise;
    };
  }])
  .factory('getUrl', ['$q', function($q) {
    return function() {
      var deferred = $q.defer();
      deferred.resolve(window.location.origin);
      return deferred.promise;
    };
  }]);
