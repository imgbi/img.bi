angular.module('imgbi.controllers', [])
  .controller('main', [
    '$scope', 'gettextCatalog', 'getUrl', 'setStorage', 'getStorage',
    function($scope, gettextCatalog, getUrl, setStorage, getStorage) {
      sjcl.random.startCollectors();
      getUrl().then(function(value) {
        $scope.url = value;
      });
      $scope.localize = function(lang) {
        gettextCatalog.setCurrentLanguage(lang);
        setStorage('lang', lang);
      };
      getStorage('lang').then(function(value) {
        if (value) {
          gettextCatalog.setCurrentLanguage(value);
        }
      });
    }
  ])
  .controller('view', [
    '$routeParams', '$scope', 'downloadFile', '$location',
    'notify', 'gettextCatalog',
    function($routeParams, $scope, downloadFile,
      $location, notify, gettextCatalog) {
      downloadFile($routeParams.id.replace('!', '')).then(function(data) {
        try {
          var uri = sjcl.decrypt($routeParams.pass, data);
          $scope.images = [{
            url: uri,
            id: $routeParams.id,
            pass: $routeParams.pass
          }];
        }
        catch (err) {
          notify(gettextCatalog.getString('Error during decryption'),
            gettextCatalog.getString('Probably password is wrong.'));
          $location.path('/');
        }
      }, function(err) {
        if (err.status === 404) {
          notify(gettextCatalog.getString('File was not found'),
            gettextCatalog.getString('Probably it was already removed.'));
        } else {
          notify(gettextCatalog.getString('Error'), err.text);
        }
        $location.path('/');
      });
    }
  ])
  .controller('remove', [
    '$routeParams', '$scope', 'downloadFile', '$location', '$window',
    'notify', 'gettextCatalog', 'removeFile',
    function($routeParams, $scope, downloadFile, $location,
      $window, notify, gettextCatalog, removeFile) {
      $scope.remove = function() {
        removeFile($routeParams.id, $routeParams.rmpass).then(
          function(ok) {
            notify(gettextCatalog.getString('Success'),
              gettextCatalog.getString('File was successfuly removed.'));
            $location.path('/');
          },
          function(err) {
            notify(gettextCatalog.getString('Error during removing'), err);
            $location.path('/');
          }
        );
      };
      downloadFile($routeParams.id).then(function(data) {
        try {
          $scope.image = sjcl.decrypt($routeParams.pass, data);
        }
        catch (err) {
          notify(gettextCatalog.getString('Error during decryption'),
            gettextCatalog.getString('Probably password is wrong.'));
          $location.path('/');
        }
      }, function(err) {
        if (err.status === 404) {
          notify(gettextCatalog.getString('File was not found'),
            gettextCatalog.getString('Probably it was already removed.'));
        } else {
          notify(gettextCatalog.getString('Error'), err.text);
        }
        $location.path('/');
      });
    }
  ])
  .controller('autoremove', [
    '$routeParams', '$scope', 'downloadFile', '$location', 'notify',
    'gettextCatalog', 'removeFile',
    function($routeParams, $scope, downloadFile, $location,
      notify, gettextCatalog, removeFile) {
      downloadFile($routeParams.id).then(function(data) {
        try {
          var uri = sjcl.decrypt($routeParams.pass, data);
          removeFile($routeParams.id, $routeParams.rmpass).then(function() {
            $scope.imageremoved = true;
          }, function(err) {
            notify(gettextCatalog.getString('Error during removing'), err);
          });
          $scope.image = uri;
        }
        catch (err) {
          notify(gettextCatalog.getString('Error during decryption'),
            gettextCatalog.getString('Probably password is wrong.'));
          $location.path('/');
        }
      }, function(err) {
        if (err.status === 404) {
          notify(gettextCatalog.getString('File was not found'),
            gettextCatalog.getString('Probably it was already removed.'));
        } else {
          notify(gettextCatalog.getString('Error'), err.text);
        }
        $location.path('/');
      });
    }
  ])
  .controller('myfiles', [
    '$scope', '$rootScope', 'myFiles', 'getFullStorage',
    function($scope, $rootScope, myFiles, getFullStorage) {
      $scope.count = 0;
      $rootScope.thumbs = [];
      $scope.loadmore = function() {
        myFiles($scope.count).then(function() {}, function() {},
          function(image) {
            $scope.images.push(image);
          }
        );
        $scope.count = $scope.count + 8;
      };
      getFullStorage().then(function(storage) {
        angular.forEach(storage, function(content, id) {
          if (id.substring(0, 6) == 'imgbi_' && id != 'imgbi_lang' && id != 'imgbi_expire') {
            if (typeof content !== 'object') {
              content = JSON.parse(content);
            }
            $rootScope.thumbs.push({
              id: id.substring(6, id.length),
              pass: content.pass,
              rmpass: content.rmpass
            });
          }
        });
        $scope.loadmore(0);
      });
    }
  ])
  .controller('upload', [
    '$scope', '$rootScope', '$location', 'getStorage',
    function($scope, $rootScope, $location, getStorage) {
      getStorage('expire').then(function(expire) {
        if (expire) {
          $rootScope.expire = expire;
        } else {
          $rootScope.expire = '180';
        }
      });

      $scope.button = function() {
        if ($scope.files[0]) {
          $location.path('/uploaded');
        }
      };
    }
  ])
  .controller('uploaded', [
    '$scope', '$rootScope', 'generateThumb', 'randomString',
    'uploadFile', 'notify', 'gettextCatalog', 'setStorage', '$q',
    function($scope, $rootScope, generateThumb, randomString,
      uploadFile, notify, gettextCatalog, setStorage, $q) {
      setStorage('expire', $rootScope.expire);
      angular.forEach($rootScope.files, function(file) {
        $q.all([generateThumb(file.url), randomString(30)]).then(
          function(ans) {
            var thumb = ans[0];
            var pass = ans[1];
            var encrypted = sjcl.encrypt(pass, file.url, {ks: 256});
            var ethumb = sjcl.encrypt(pass, thumb, {ks: 256});
            uploadFile(ethumb, encrypted, $rootScope.expire).then(
              function(data) {
                $scope.images.push({
                  url: file.url,
                  id: data.id,
                  pass: pass,
                  rmpass: data.rmpass
                });
                setStorage(data.id, {pass: pass, rmpass: data.rmpass});
              }, function(err) {
                notify(gettextCatalog.getString('Error'), err);
              }
            );
          }
        );
      });
    }
  ]);
