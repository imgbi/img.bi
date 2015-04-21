describe('storage.js', function() {
  var $rootScope;
  
  beforeEach(module('imgbi.storage'));
  
  beforeEach(function() {
    module(function($provide) {
      $provide.constant('url', 'a');
    });
  });
  
  beforeEach(inject(function($injector) {
    $rootScope = $injector.get('$rootScope');
  }));
  
  describe('rmStorage', function() {
    var rmStorage;
    
    beforeEach(inject(function($injector) {
      rmStorage = $injector.get('rmStorage');
    }));

    it('Should remove item from localStorage', function() {
      localStorage.setItem('a', 'b');
      rmStorage('a');
      expect(localStorage.getItem('a')).toBe(null);
    });
  });
  
  describe('setStorage', function() {
    var setStorage;
  
    beforeEach(inject(function($injector) {
      setStorage = $injector.get('setStorage');
    }));

    it('Should add item to localStorage', function() {
      setStorage('a','b');
      expect(localStorage.getItem('a')).toBe('b');
    });
    
    it('Should convert objects to JSON', function() {
      setStorage('a',{ a : 'b' });
      expect(localStorage.getItem('a')).toBe('{"a":"b"}');
    });
  });
  
  describe('getStorage', function() {
    var getStorage;
  
    beforeEach(inject(function($injector) {
      getStorage = $injector.get('getStorage');
    }));

    it('Should get item from localStorage and parse it', function() {
      localStorage.setItem('a', '{"a": "b"}');
      var result;
      getStorage('a').then(function(data) {
        result = data;
      });
      $rootScope.$digest();
      expect(result.a).toBe('b');
    });
    
    it('Should correctly work with lang and expire', function() {
      localStorage.setItem('lang', 'a');
      localStorage.setItem('expire', 'b');
      var lang;
      getStorage('lang').then(function(data) {
        lang = data;
      });
      var expire;
      getStorage('expire').then(function(data) {
        expire = data;
      });
      $rootScope.$digest();
      expect(lang).toBe('a');
      expect(expire).toBe('b');
    });
  });
  
  describe('#getFullStorage', function() {
    var getFullStorage;
  
    beforeEach(inject(function($injector) {
      getFullStorage = $injector.get('getFullStorage');
    }));

    it('Should return full localStorage', function() {
      localStorage.setItem('a', 'a');
      localStorage.setItem('b', 'b');
      var result;
      getFullStorage().then(function(data) {
        result = data;
      });
      $rootScope.$digest();
      expect(result.a).toBe('a');
      expect(result.b).toBe('b');
    });
  });
  
  describe('getUrl', function() {
    var getUrl;
  
    beforeEach(inject(function($injector) {
      getUrl = $injector.get('getUrl');
    }));

    it('Should return URL', function() {
      var result;
      getUrl().then(function(data) {
        result = data;
      });
      $rootScope.$digest();
      expect(result).toBe('a');
    });
  });
});


