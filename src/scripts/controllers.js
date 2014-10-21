angular.module('imgbi.controllers', [])
  .controller('main', ['$scope', 'gettextCatalog', 'config', 'url', function($scope, gettextCatalog, config, url) {
    sjcl.random.startCollectors();
    $scope.config = config;
    $scope.url = url;
    $scope.localize = function(lang) {
      gettextCatalog.setCurrentLanguage(lang);
      localStorage.setItem('lang', lang);
    };
    if (localStorage.getItem('lang')) {
      gettextCatalog.setCurrentLanguage(localStorage.getItem('lang'));
    }
  }])
  .controller('view', ['$routeParams', '$scope', '$http', '$location', 'notify', 'gettextCatalog', function($routeParams, $scope, $http, $location, notify, gettextCatalog) {
    $http({method: 'GET', url: '/download/' + $routeParams.id.replace('!','')})
      .success(function(data) {
        try {
          var uri = sjcl.decrypt($routeParams.pass, JSON.stringify(data));
          $scope.images = [{
            url: uri,
            id: $routeParams.id,
            pass: $routeParams.pass
          }];
        } 
        catch (err) {
          notify(gettextCatalog.getString('Error during decryption'),gettextCatalog.getString('Probably password is wrong.'));
          $location.path('/');
        }
      })
      .error(function(err,status) {
        if (status === 404) {
          notify(gettextCatalog.getString('File was not found'), gettextCatalog.getString('Probably it was already removed.'));
        }
        else {
          notify(gettextCatalog.getString('Error'), err);
        }
        $location.path('/');
      });
  }])
  .controller('remove', ['$routeParams', '$scope', '$http', '$location', '$window', 'notify', 'gettextCatalog', 'removeFile', function($routeParams, $scope, $http, $location, $window, notify, gettextCatalog, removeFile) {
    $scope.remove = function() {
      removeFile($routeParams.id,$routeParams.rmpass).then(
        function(ok) {
          notify(gettextCatalog.getString('Success'), gettextCatalog.getString('File was successfuly removed.'));
          $location.path('/');
        },
        function(err) {
          notify(gettextCatalog.getString('Error during removing'), err);
          $location.path('/');
        }
      );
    };
    $http({method: 'GET', url: '/download/' + $routeParams.id})
      .success(function(data) {
        try {
          $scope.image = sjcl.decrypt($routeParams.pass, JSON.stringify(data));
        }
        catch (err) {
          notify(gettextCatalog.getString('Error during decryption'),gettextCatalog.getString('Probably password is wrong.'));
          $location.path('/');
        }
      })
      .error(function(err,status) {
        if (status === 404) {
          notify(gettextCatalog.getString('File was not found'), gettextCatalog.getString('Probably it was already removed.'));
        }
        else {
          notify(gettextCatalog.getString('Error'), err);
        }
        $location.path('/');
      });
  }])
  .controller('autoremove', ['$routeParams', '$scope', '$http', '$location', 'notify', 'gettextCatalog', 'removeFile', function($routeParams, $scope, $http, $location, notify, gettextCatalog, removeFile) {
    $http({method: 'GET', url: '/download/' + $routeParams.id})
      .success(function(data) {
        try {
          var uri = sjcl.decrypt($routeParams.pass, JSON.stringify(data));
          removeFile($routeParams.id,$routeParams.rmpass).then(function(ok) {
            }, function(err) {
              notify(gettextCatalog.getString('Error during removing'), err);
            }
          );
          $scope.image = uri;
        }
        catch (err) {
          notify(gettextCatalog.getString('Error during decryption'),gettextCatalog.getString('Probably password is wrong.'));
          $location.path('/');
        }
      })
      .error(function(err,status) {
        if (status === 404) {
          notify(gettextCatalog.getString('File was not found'), gettextCatalog.getString('Probably it was already removed.'));
        }
        else {
          notify(gettextCatalog.getString('Error'), err);
        }
        $location.path('/');
      });
  }])
  .controller('myfiles', ['$scope', '$rootScope', 'myFiles', function($scope, $rootScope, myFiles) {
    $scope.count = 0;
    $rootScope.thumbs = [];
    for (var i = 0; i < localStorage.length; i++) {
      var id = localStorage.key(i);
      if (id != 'lang' && id != 'expire') {
        var image = JSON.parse(localStorage.getItem(id));
        $rootScope.thumbs.push({id: id, pass: image.pass, rmpass: image.rmpass});
      }
    }
    $scope.loadmore = function() {
      myFiles($scope.count).then(function(success){}, function(err){}, function (image) {
        $scope.images.push(image);
      });
      $scope.count = $scope.count + 8;
    };
    $scope.loadmore(0);
  }])
  .controller('upload', ['$scope', '$rootScope', '$location', function($scope, $rootScope, $location) {
    if (localStorage.getItem('expire')) {
      $rootScope.expire = localStorage.getItem('expire');
    }
    else {
      $rootScope.expire = 180;
    }
    $scope.button = function() {
      if ($scope.files[0]) {
        $location.path('/uploaded');
      }
    };
  }])
  .controller('uploaded', ['$scope', '$rootScope', '$http', 'generateThumb', 'randomString', 'param', 'notify', 'gettextCatalog', function($scope, $rootScope, $http, generateThumb, randomString, param, notify, gettextCatalog) {
    localStorage.setItem('expire', $rootScope.expire);
    angular.forEach($rootScope.files, function(file) {
      generateThumb(file.url).then(function(thumb) {
        var pass = randomString(40),
        encrypted = sjcl.encrypt(pass, file.url, {ks: 256}),
        ethumb = sjcl.encrypt(pass, thumb, {ks: 256});
        $http({
          method: 'POST',
          url: '/api/upload',
          data: param({thumb: ethumb, encrypted: encrypted, expire: $rootScope.expire}),
          headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
          .success(function(data) {
            if(data.status == 'OK') {
              $scope.images.push({
                url: file.url,
                id: data.id,
                pass: pass,
                rmpass: data.pass
              });
              localStorage.setItem(data.id, JSON.stringify({pass: pass, rmpass: data.pass}));
            }
          })
          .error(function(err) {
            notify(gettextCatalog.getString('Error'), err);
          });
      });
    });
  }]);
