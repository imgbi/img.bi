---
---
var MINI = require('minified'),
_=MINI._, $=MINI.$, $$=MINI.$$, EE=MINI.EE, HTML=MINI.HTML,
acceptedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp'],
maxSize = 3145728,
siteurl = '{{ site.url }}',
siteapi = '{{ site.api }}',
sitecdn = '{{ site.cdn }}',
clearneturl = '{{ site.clearnet }}',
torurl = '{{ site.tor }}',
i2purl = '{{ site.i2p }}';

$(function() {
  sjcl.random.startCollectors();
  var cookielang = document.cookie.replace(/(?:(?:^|.*;\s*)lang\s*\=\s*([^;]*).*$)|^.*$/, '$1');
  localizeAll(cookielang);
  changeColor();
  $('#uploadpage').set('-hidden');
  if (window.location.hash.indexOf('!') != '-1') {
    $('#uploadpage').set('hidden');
    $('#loading').set('-hidden');
    var params = window.location.hash.split('!');
    if (window.location.href.indexOf('/autorm/') != '-1') {
      loadFile(params[1],params[2],params[3]);
    }
    else {
      loadFile(params[1],params[2]);
    }
  }
  $('#logo').on('mouseover', function() {
    changeColor();
  });
  $('#holder').on('click', function() {
    $('#imageUpload')[0].click();
  });
  $('#imageUpload').on('change', function() {
    previewFiles($('#imageUpload')[0].files);
  });
  $('#holder').on('dragover', function () {
    $('#holder').set('hover');
  });
  $('#holder').on('dragend drop', function () {
    $('#holder').set('-hover');
  });
  $('#holder').on('drop', function (e) {
    previewFiles(e.dataTransfer.files);
  });

  $('#button').on('click', function() {
    $('#button').set('+hidden');
    $('#uploading').set('-hidden');
    uploadFiles();
  });

  $('#remove-button').on('click', function() {
    var params = window.location.hash.split('!');
    removeFile(params[1],params[3]);
    alert('Removed');
    window.location = '/';
  });

  $('.imageview img').on('click', function() {
    if ($(this).get('@class') == 'image') {
      $(this).set('+zoom-out -image');
    }
    else {
      $(this).set('+image -zoom-out');
    }
  });
  $('#en').on('click', function() {
    localizeAll('en');
    document.cookie = 'lang=en; expires=Sun, 25 May 2042 00:42:00 UTC; path=/'
  });
  $('#ru').on('click', function() {
    localizeAll('ru');
    document.cookie = 'lang=ru; expires=Sun, 25 May 2042 00:42:00 UTC; path=/'
  });
  $('#it').on('click', function() {
    localizeAll('it');
    document.cookie = 'lang=it; expires=Sun, 25 May 2042 00:42:00 UTC; path=/'
  });
  
  $('.button-web').on('click', function() {
    $('.nav-tabs li').set('-active');
    $('.button-web').set('+active');
    changeURL(clearneturl);
  });
  $('.button-tor').on('click', function() {
    $('.nav-tabs li').set('-active');
    $('.button-tor').set('+active');
    changeURL(torurl);
  });
  $('.button-eep').on('click', function() {
    $('.nav-tabs li').set('-active');
    $('.button-eep').set('+active');
    changeURL(i2purl);
  });
  
});

function changeColor() {
  var colors = ['red', 'green', 'black', 'yellow', 'orange', 'purple', 'grey', 'blue'];
  $('#logo').set(colors[Math.floor(Math.random()*colors.length)]);
}

function localizeAll(lang) {
  String.locale = lang;
  $('[data-l10n]').each(function(elem) {
    $(elem).fill(HTML(l($(elem).get('%l10n'),elem.innerHTML)));
  });
  
  document.documentElement.lang = String.locale;
}

function l(string, fallback) {
	var localized = string.toLocaleString();
	if (localized !== string) {
		return localized;
	}
  else {
		return fallback;
	}
}


function uploadFiles() {
  $('#holder img').each(function(image,count) {
    var pass = randomString(40),
    encrypted = sjcl.encrypt(pass, image.src, {ks:256});
    $.request('post', siteapi + '/upload', {encrypted:encrypted})
      .then(function success(txt) {
        var json = $.parseJSON(txt);
        if (json.status == 'OK') {
          $('#viewpage').set('-hidden');
          $('#uploadpage').set('+hidden');
          showImage(image.src,count);
          addLinks(json.id,pass,json.pass,count);
        }
        else {
          alert(json.status);
        }
      },
      function error(status, statusText, responseText) {
        alert(l('failed-upload','Failed to upload image'));
    });
  });
}

function randomString(length) {
  var charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  i,
  result = '',
  values = sjcl.random.randomWords(length);
  for(i=0; i<length; i++) {
    result += charset[values[i].toString().replace('-','') % charset.length];
  }
  return result;
}

function loadFile(id,pass,rmpass) {
  $.request('get', sitecdn + id)
    .then(function success(txt) {
      try {
        var result = sjcl.decrypt(pass,txt),
        data = result.match(/^data:(.+);base64,*/);
        if (acceptedTypes.indexOf(data[1]) != '-1') {
          if (rmpass) {
            removeFile(id,rmpass);
          }
          if (window.location.href.indexOf('rm/') == '-1') {
            addLinks(id,pass,rmpass,0);
          }
          showImage(result,0);
        }
      }
      catch(e) {
        alert(l('failed-decrypt', 'Failed to decrypt image'));
        window.location = '/';
        return;
      }
    },
    function error(status, statusText, responseText) {
      alert(l('failed-load','Failed to load image'));
      window.location = '/';
    });
  
}
function showImage(datauri,count) {
  if (count > 0) {
    $('#viewpage').add($('#viewpage .imageview').only(0).clone());
  }
  $('#loading').set('+hidden');
  $('#viewpage').set('-hidden');
  $('.image').sub(count).set({'@src': datauri, '@class': 'image'});
  
}

function addLinks(id,pass,rmpass,count) {
  if (count > 0) {
    $('#viewpage').add($('#viewpage .inputs').only(0).clone());
  }
  $('.link-view').sub(count).set('@value',siteurl + '/#!' + id + '!' + pass);
  $('.embed').sub(count).set('@value','<img data-imgbi="' + siteurl + ' /#!' + id + '!' + pass + '" />');
  if (rmpass) {
    $('.rmlinks').set('-hidden');
    $('.link-remove').sub(count).set('@value',siteurl + '/rm/#!' + id + '!' + pass + '!' + rmpass);
    $('.link-auto-remove').sub(count).set('@value',siteurl + '/autorm/#!' + id + '!' + pass + '!' + rmpass);
  }
}

function previewFiles(files) {
  for (var i = 0; i < files.length; i++) {
    if (acceptedTypes.indexOf(files[i].type) != '-1') {
      if (files[i].size < maxSize) {
        var reader = new FileReader();
        reader.onload = function (event) {
          $('#help').remove();
          $('#holder').add(EE('img', {'@src':event.target.result}));
        };
        reader.readAsDataURL(files[i]);
      }
      else {
        alert(l('filesize','Sorry, filesize over 3 MiB is not allowed'));
      }
    }
    else {
      alert(file.type + ': ' + l('filetype','sorry, filetype not supported'));
    }
  }
}

function removeFile(id,rmpass) {
  $.request('get', siteapi + '/remove', {id:id,password:rmpass})
    .then(function success(txt) {
      var json = $.parseJSON(txt);
      if (json.status != 'Success') {
        alert(l('failed-remove', 'Failed to remove image') + ': ' + json.status);
      }
    },
    function error(status, statusText, responseText) {
      alert(l('failed-remove', 'Failed to remove image'));
    });
}

function changeURL(url) {
  $('.link-view').each(function(elem) {
    $(elem).set('@value',_.toString($(elem).get('@value')).replace(/^https?:\/\/.*?\//,url + '/'));
  });
  $('.embed').each(function(elem) {
    $(elem).set('@value',_.toString($(elem).get('@value')).replace(/https?:\/\/.*?\//,url + '/'));
  });
  $('.link-remove').each(function(elem) {
    $(elem).set('@value',_.toString($(elem).get('@value')).replace(/^https?:\/\/.*?\//,url + '/'));
  });
  $('.link-auto-remove').each(function(elem) {
    $(elem).set('@value',_.toString($(elem).get('@value')).replace(/^https?:\/\/.*?\//,url + '/'));
  });
}

