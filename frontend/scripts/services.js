angular.module('imgbi.services', [])
  .factory('previewFile', [
    '$q', 'notify', 'gettextCatalog', 'config',
    function($q, notify, gettextCatalog, config) {
      return function(file) {
        var deferred = $q.defer();
        if (config.acceptedTypes.indexOf(file.type) != '-1') {
          if (file.size < config.maxSize) {
            var reader = new FileReader();
            reader.onloadend = function(event) {
              deferred.resolve(event.target.result);
            };
            reader.readAsDataURL(file);
          } else {
            notify(gettextCatalog.getString('Error'),
              gettextCatalog.getString(
                'Sorry, filesize over %s MiB is not allowed.'
              ),
              config.maxSize / 1024 / 1024
            );
          }
        } else {
          notify(gettextCatalog.getString('Error'),
            gettextCatalog.getString(
              'Sorry, filetype %s is not supported.'
            ), file.type);
        }
        return deferred.promise;
      };
    }
  ])
  .factory('generateThumb', ['$q', function($q) {
    return function(file) {
      var deferred = $q.defer();
      var img = new Image();
      var thumbsize = 300;
      img.src = file;
      img.onload = function() {
        var c = document.createElement('canvas');
        var cx = c.getContext('2d');
        var widthratio = img.width / thumbsize;
        var heightratio = img.height / thumbsize;
        var maxratio = Math.max(widthratio, heightratio);
        var w;
        var h;
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
  .factory('getThumb', [
    '$q', 'downloadThumb',
    function($q, downloadThumb) {
      return function(id, pass, rmpass) {
        var deferred = $q.defer();
        downloadThumb(id).then(function(data) {
          var result = sjcl.decrypt(pass, data);
          if (result.match(/^data:(.+);base64,*/)[1] == 'image/jpeg') {
            deferred.resolve({
              uri: result,
              id: id,
              pass: pass,
              rmpass: rmpass
            });
          }
        });
        return deferred.promise;
      };
    }
  ])
  .factory('randomString', ['$q', function($q) {
    return function(length) {
      var deferred = $q.defer();
      var result = '';
      var checkReadyness = setInterval(function() {
        if (sjcl.random.isReady()) {
          var bytes = sjcl.random.randomWords(4);
          result += sjcl.codec.base64.fromBits(bytes, true, true);
        }
        if (result.length >= length) {
          result = result.substr(0, length);
          deferred.resolve(result);
          clearInterval(checkReadyness);
        }
      }, 1);
      return deferred.promise;
    };
  }])
  .factory('myFiles', [
    '$q', '$rootScope', 'getThumb',
    function($q, $rootScope, getThumb) {
      return function(count) {
          var deferred = $q.defer();
          /*jshint -W083 */
          for (
            var i = count;
            i < count + 8 && i < $rootScope.thumbs.length;
            i++
          ) {
            getThumb(
              $rootScope.thumbs[i].id, $rootScope.thumbs[i].pass,
              $rootScope.thumbs[i].rmpass).then(function(image) {
                deferred.notify(image);
              }
            );
          }
          /*jshint +W083 */
          return deferred.promise;
        };
    }
  ])
  .factory('notify', ['$modal', function($modal) {
    return function(title, content, sprintf) {
        if (sprintf) {
          $modal({
            title: title,
            content: content.replace('%s', sprintf),
            show: true
          });
        } else {
          $modal({
            title: title,
            content: content,
            show: true
          });
        }
      };
  }]);
