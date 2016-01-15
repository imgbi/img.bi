// jscs:disable maximumLineLength
// https://stackoverflow.com/questions/21644493/how-to-split-the-ng-repeat-data-with-three-columns-using-bootstrap
// jscs:enable
angular.module('imgbi.filters', [])
  .filter('partition', function() {
    var cache = {};
    var filter = function(arr, size) {
      if (!arr) { return; }
      var newArr = [];
      for (var i = 0; i < arr.length; i += size) {
        newArr.push(arr.slice(i, i + size));
      }
      var arrString = JSON.stringify(arr);
      var fromCache = cache[arrString + size];
      if (JSON.stringify(fromCache) === JSON.stringify(newArr)) {
        return fromCache;
      }
      cache[arrString + size] = newArr;
      return newArr;
    };
    return filter;
  });
