angular.module('imgbi.clipboard', [])
  .directive('copy', function() {
    return {
      restrict: 'AE',
      link: function($scope, $element) {
        ZeroClipboard.config( { swfPath: '../ZeroClipboard.swf' } );
        new ZeroClipboard($element);
      }
    };
  });
