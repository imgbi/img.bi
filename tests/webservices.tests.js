describe('webservices.js', function() {
  var $httpBackend,
  rmStorageSpy,
  $rootScope;
  
  var paramData = 'thumb=a&encrypted=b&expire=c';
  
  beforeEach(module('imgbi.webservices'));
  
  beforeEach(function() {
    var rmStorageMock = function(id) {
      rmStorageSpy = jasmine.createSpy('rmStorageSpy');
      rmStorageSpy(id);
    };
    var paramMock = function(data) {
      return paramData;
    };
    module(function($provide) {
      $provide.value('rmStorage', rmStorageMock);
      $provide.value('param', paramMock);
    });
  });
  
  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');
    $rootScope = $injector.get('$rootScope');
  }));
  
  describe('downloadFile', function() {
    var downloadFile;
    beforeEach(inject(function($injector) {
      downloadFile = $injector.get('downloadFile');
    }));
    
    it('Should download file', function() {
      $httpBackend
        .expectGET('/download/a')
        .respond(function() {
          return [200, '{"a":"b"}'];
        });
      var result;
      downloadFile('a').then(function(data) {
        result = data;
      });
      $httpBackend.flush();
      $rootScope.$digest();
      expect(result).toBe('{"a":"b"}');
    });
    
    it('Should correctly return error', function() {
      $httpBackend
        .expectGET('/download/a')
        .respond(function() {
          return [404, 'not found'];
        });
      var result;
      downloadFile('a').then(null,function(err) {
        result = err;
      });
      $httpBackend.flush();
      $rootScope.$digest();
      expect(result.text).toBe('not found');
      expect(result.status).toBe(404);
    });
  });
  
  describe('downloadThumb', function() {
    var downloadThumb;

    beforeEach(inject(function($injector) {
      downloadThumb = $injector.get('downloadThumb');
    }));
    
    it('Should download thumb', function() {
      $httpBackend
        .expectGET('/download/thumb/a')
        .respond(function() {
          return [200, '{"a":"b"}'];
        });
      var result;
      downloadThumb('a').then(function(data) {
        result = data;
      });
      $httpBackend.flush();
      $rootScope.$digest();
      expect(result).toBe('{"a":"b"}');
    });
    
    it('Should call rmStorage if 404', function() {
      $httpBackend
        .expectGET('/download/thumb/a')
        .respond(function() {
          return [404, 'not found'];
        });
      downloadThumb('a');
      $httpBackend.flush();
      $rootScope.$digest();
      expect(rmStorageSpy).toHaveBeenCalledWith('a');
    });
  });
  
  describe('removeFile', function() {
    var removeFile;

    beforeEach(inject(function($injector) {
      removeFile = $injector.get('removeFile');
    }));
    
    it('Should remove file', function() {
      $httpBackend
        .expectGET('/api/remove?id=a&password=b')
        .respond(function() {
          return [200, '{"status":"Success"}'];
        });
      var result;
      removeFile('a','b').then(function(data) {
        result = data;
      });
      $httpBackend.flush();
      $rootScope.$digest();
      expect(result).toBe(true);
    });
    
    it('Should call rmStorage', function() {
      $httpBackend
        .expectGET('/api/remove?id=a&password=b')
        .respond(function() {
          return [200, '{"status":"Success"}'];
        });
      removeFile('a','b');
      $httpBackend.flush();
      $rootScope.$digest();
      expect(rmStorageSpy).toHaveBeenCalledWith('a');
    });
    
    it('Should return backend error', function() {
      $httpBackend
        .expectGET('/api/remove?id=a&password=b')
        .respond(function() {
          return [200, '{"status":"Error"}'];
        });
      var result;
      removeFile('a','b').then(null,function(err) {
        result = err;
      });
      $httpBackend.flush();
      $rootScope.$digest();
      expect(result).toBe('Error');
    });
    
    it('Should return server error', function() {
      $httpBackend
        .expectGET('/api/remove?id=a&password=b')
        .respond(function() {
          return [404, 'not found'];
        });
      var result;
      removeFile('a','b').then(null,function(err) {
        result = err;
      });
      $httpBackend.flush();
      $rootScope.$digest();
      expect(result).toBe('not found');
    });
  });
  
  describe('uploadFile', function() {
    var uploadFile;
    beforeEach(inject(function($injector) {
      uploadFile = $injector.get('uploadFile');
    }));
    
    it('Should upload file', function() {
      $httpBackend
        .expectPOST('/api/upload', paramData)
        .respond(function() {
          return [200, '{"status":"OK","id":"a","pass":"b"}'];
        });
      var result;
      uploadFile('a').then(function(data) {
        result = data;
      });
      $httpBackend.flush();
      $rootScope.$digest();
      expect(result.id).toBe('a');
      expect(result.rmpass).toBe('b');
    });
    
    it('Should return server error', function() {
      $httpBackend
        .expectPOST('/api/upload', paramData)
        .respond(function() {
          return [451, 'you are in some distopia'];
        });
      var result;
      uploadFile('a','b').then(null,function(err) {
        result = err;
      });
      $httpBackend.flush();
      $rootScope.$digest();
      expect(result).toBe('you are in some distopia');
    });

  });
});
