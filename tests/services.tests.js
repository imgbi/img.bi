describe('services.js', function() {
  var $rootScope,
  $q,
  modalSpy;
  
  beforeEach(module('imgbi.services'));
  
  beforeEach(function() {
    var modalMock = function(data) {
      modalSpy = jasmine.createSpy('modalSpy');
      modalSpy(data);
    };
    var downloadThumbMock = function($q) {
      var promise = jasmine.createSpy('downloadThumb').andCallFake(function() {
        return $q.when('a');
      });
      return promise;
    };
    
    module(function($provide) {
      $provide.value('$modal', modalMock);
      $provide.factory('downloadThumb', downloadThumbMock);
    });
  });
  
  beforeEach(inject(function($injector) {
    $rootScope = $injector.get('$rootScope');
    $q = $injector.get('$q');
  }));
  
  describe('param', function() {
    var param;
    beforeEach(inject(function($injector) {
      param = $injector.get('param');
    }));

    it('Should convert object to params', function() {
      var test = {
        a: 'a a',
        b: 'b'
      };
      expect(param(test)).toBe('a=a+a&b=b');
    });
  });
  
  describe('notify', function() {
    var notify;
    
    beforeEach(inject(function($injector) {
      notify = $injector.get('notify');
      
    }));
    
    it('Should open modal', function() {
      notify('a','b');
      expect(modalSpy).toHaveBeenCalledWith({ title: 'a', content: 'b', show: true });
    });
    
    it('Should work with sprintf', function() {
      notify('a','b%s','c');
      expect(modalSpy).toHaveBeenCalledWith({ title: 'a', content: 'bc', show: true });
    });
  });
  
});
