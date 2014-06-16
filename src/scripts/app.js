var imgbi = angular.module('imgbi', [
  'ngRoute',
  'gettext',
  'mgcrea.ngStrap.modal',
  'imgbi.config',
  'imgbi.services',
  'imgbi.directives',
  'imgbi.controllers',
  'imgbi.filters'
]);

imgbi.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/:id!:pass', {templateUrl: 'partials/view.html', controller: 'view'})
    .when('/rm/:id!:pass!:rmpass', {templateUrl: 'partials/rm.html', controller: 'remove'})
    .when('/autorm/:id!:pass!:rmpass', {templateUrl: 'partials/autorm.html', controller: 'autoremove'})
    .when('/my', {templateUrl: 'partials/my.html', controller: 'myfiles'})
    .when('/contacts', {templateUrl: 'partials/contacts.html'})
    .when('/apps', {templateUrl: 'partials/apps.html'})
    .when('/ads', {templateUrl: 'partials/ads.html'})
    .when('/donate', {templateUrl: 'partials/donate.html'})
    .when('/js', {templateUrl: 'partials/js.html'})
    .when('/uploaded', {templateUrl: 'partials/view.html', controller: 'uploaded'})
    .otherwise({templateUrl: 'partials/upload.html', controller: 'upload'});
  }])
  .config(function($modalProvider) {
    angular.extend($modalProvider.defaults, {
      template: 'partials/modal.tpl.html'
    });
  });
        

