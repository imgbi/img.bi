angular.module('imgbi.directives', [])
  .directive('holder', ['previewFile', function(previewFile) {
    return {
      link: function($rootScope, $element) {
        $element.bind('click', function(event) {
          event.preventDefault();
          document.getElementById('imageUpload').click();
        });
        
        $element.bind('dragover', function(event) {
          event.stopPropagation();
          event.preventDefault();
          $element.addClass('hover');
        });
        
        $element.bind('dragleave', function(event) {
          event.stopPropagation();
          event.preventDefault();
          $element.removeClass('hover');
        });
        
        $element.bind('drop', function(event) {
          event.stopPropagation();
          event.preventDefault();
          angular.forEach(event.dataTransfer.files, function(file) {
            previewFile(file).then(function(url) {
              $rootScope.files.push({url: url});
            });
          });
        });
      }
    };
  }])
  .directive('imageinput', ['previewFile', function(previewFile, filesList) {
    return {
      link: function($rootScope, $element) {
        $element.bind('change', function(event) {
          angular.forEach(event.target.files, function(file) {
            previewFile(file).then(function(url) {
              $rootScope.files.push({url: url});
            });
          });
        });
      }
    };
  }])
  .directive('expire', function() {
    return {
      link: function($element) {
        if (localStorage.getItem('expire')) {
        
        }
        else {
          localStorage.setItem('expire', $element[0].options[$element[0].selectedIndex].value);
        }
        $element.bind('change', function(event) {
          
        });
      }
    };
  });
