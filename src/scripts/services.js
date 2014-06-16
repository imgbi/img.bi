angular.module('imgbi.services', [])
  .factory('previewFile', ['$q', 'notify', 'gettextCatalog', 'config', function ($q, notify, gettextCatalog, config) {
    return function(file) {
      var deferred = $q.defer();
      if (config.acceptedTypes.indexOf(file.type) != '-1') {
        if (file.size < config.maxSize) {
          var reader = new FileReader();
          reader.onloadend = function(event) {
            deferred.resolve(event.target.result);
          };
          reader.readAsDataURL(file);
        }
        else {
          notify(gettextCatalog.getString('Error'), gettextCatalog.getString('Sorry, filesize over %s MiB is not allowed.'), config.maxSize/1024/1024);
        }
      }
      else {
        notify(gettextCatalog.getString('Error'), gettextCatalog.getString('Sorry, filetype %s is not supported.'), file.type);
      }
      return deferred.promise;
    };
  }])
  .factory('generateThumb', ['$q', function ($q) {
    return function(file) {
      var deferred = $q.defer();
      var img = new Image(),
      thumbsize = 300;
      img.src = file;
      img.onload = function() {
        var c = document.createElement('canvas'),
        cx = c.getContext('2d'),
        widthratio = img.width / thumbsize,
        heightratio = img.height / thumbsize,
        maxratio = Math.max(widthratio, heightratio),
        w,
        h;
        if (maxratio > 1) {
          w = img.width / maxratio;
          h = img.height / maxratio;
        } else {
          w = img.width;
          h = img.height;
        }
        c.width = w;
        c.height = h;
        cx.fillStyle = 'white';
        cx.fillRect(0, 0, w, h);
        cx.drawImage(img, 0, 0, w, h);
        deferred.resolve(c.toDataURL('image/jpeg', 0.7));
      };
      return deferred.promise;
    };
  }])
  .factory('randomString', [function() {
      return function(length) {
        var charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        i,
        result = '',
        values = sjcl.random.randomWords(length);
        for (i = 0; i < length; i++) {
          result += charset[values[i].toString().replace('-', '') % charset.length];
        }
        return result;
      };
  }])
  .factory('param', [function() {
      return function(obj) {
        var params = [];
        angular.forEach(obj, function(value, key) {
          this.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
        }, params);
        return params.join('&').replace(/%20/g, '+');
      };
  }])
  .factory('removeFile', ['$q', '$http', function($q, $http) {
      return function(id, rmpass) {
        var deferred = $q.defer();
        $http({
          method: 'GET',
          url: '/api/remove',
          params: {id: id, password: rmpass}
        })
        .success(function(data) {
          if (data.status == 'Success') {
            localStorage.removeItem(id);
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
  .factory('myFiles', ['$q', '$rootScope', 'getThumb', function($q, $rootScope, getThumb) {
      return function(count) {
        var deferred = $q.defer();
        /*jshint -W083 */
        for (var i = count; i < count + 8 && i < $rootScope.thumbs.length; i++) {
          getThumb($rootScope.thumbs[i].id,$rootScope.thumbs[i].pass,$rootScope.thumbs[i].rmpass).then(function (image){
            deferred.notify(image);
          });
        }
        /*jshint +W083 */
        return deferred.promise;
      };
  }])
  .factory('getThumb', ['$q', '$http', function($q, $http) {
      return function(id, pass, rmpass) {
        var deferred = $q.defer();
        $http({
          method: 'GET',
          url: '/download/thumb/' + id
        }).success(function(data, status) {
          var result = sjcl.decrypt(pass, JSON.stringify(data));
          if (result.match(/^data:(.+);base64,*/)[1] == 'image/jpeg') {
            deferred.resolve({
              uri: result,
              id: id,
              pass: pass,
              rmpass: rmpass
            });
          }
        })
        .error(function(data, status) {
          if (status === 404) {
            localStorage.removeItem(id);
          }
        });
        return deferred.promise;
      };
  }])
  .factory('notify', ['$modal', function($modal) {
      return function (title,content,sprintf) {
        if (sprintf) {
          $modal({title: title, content: content.replace('%s', sprintf), show: true});
        }
        else {
          $modal({title: title, content: content, show: true});
        }
      };
  }]);
