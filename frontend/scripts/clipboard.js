angular.module('imgbi.clipboard', [])
  .directive('copy', function() {
    return {
      restrict: 'AE',
      link: function($scope, $element) {
        new Clipboard($element[0]);
      }
    };
  });
