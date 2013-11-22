---
---
var holder = document.getElementById('holder'),
imageUpload = document.getElementById('imageUpload'),
button = document.getElementById('button'),
logo = document.getElementById('logo'),
uploadpage = document.getElementById('uploadpage'),
viewpage = document.getElementById('viewpage'),
loading = document.getElementById('loading'),
removeButton = document.getElementById('remove-button'),
autormButton = document.getElementById('autorm-button'),
allFiles = [],
uploadedFiles = [],
zoom,
isFiles,
acceptedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp'],
maxSize = '3145728';
if (window.addEventListener) {
  window.addEventListener('load', imgBi, false);
}
else if(window.attachEvent) {
  window.attachEvent('onload', imgBi);
}
else {
  document.addEventListener('load', imgBi, false);
}
function imgBi() {
  sjcl.random.startCollectors();
  var cookielang = document.cookie.replace(/(?:(?:^|.*;\s*)lang\s*\=\s*([^;]*).*$)|^.*$/, "$1");
  localizeAll(cookielang);
  changeColor();
  if (uploadpage) {
    uploadpage.className = '';
  }
  if (window.location.hash.indexOf('!') != '-1') {
    if (uploadpage) {
      uploadpage.className = 'hidden';
      loading.className = '';
    }
    if (window.location.href.indexOf('/autorm/') == '-1') {
      var parameters = window.location.hash.split('!');
      loadFile(parameters[1],parameters[2]);
    }
  }
}
function setZoom() {
  var image = document.getElementsByClassName('image');
  for (var i = 0; i < image.length; ++i) {
      var item = image[i];  
      item.onclick = function() {
        if (zoom != 1) {
          this.className = 'zoom-out';
          zoom = 1;
        }
        else {
          this.className = 'image';
          zoom = 0;
        }
      };
  }
}
function previewfile(file) {
  if (acceptedTypes.indexOf(file.type) != '-1') {
    if (file.size < maxSize) {
      var reader = new FileReader();
      reader.onload = function (event) {
        removeHelp();
        encryptfile(event.target.result);
        var image = new Image();
        image.src = event.target.result;
        image.width = 250;
        holder.appendChild(image);
      };
      reader.readAsDataURL(file);
      isFiles = true;
    }
    else {
      alert(l('filesize','Sorry, filesize over 3 MiB is not allowed'));
    }
  }
  else {
    alert(file.type + ': ' + l('filetype','sorry, filetype not supported'));
  }
}
function readfiles(files) {
    for (var i = 0; i < files.length; i++) {
      previewfile(files[i]);
    }
}
function removeHelp(){
  var help = document.getElementById('help');
  if (help) {
    help.outerHTML = '';
    delete help;
  }
}

function encryptfile(file) {
  var pass = randomString(40);
  var encrypted = sjcl.encrypt(pass, file, {ks:256});
  allFiles.push({pass:pass,data:encrypted,uri:file});
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
function showImages() {
  uploadpage.className = 'hidden';
  for (i in uploadedFiles) {
    showImage(uploadedFiles[i].id, uploadedFiles[i].pass, uploadedFiles[i].uri, uploadedFiles[i].remove);
  }
  setZoom();
}

function showImage(id, pass, uri, remove) {
  var images = document.createElement('div');
  images.className = 'text-center';
  viewpage.appendChild(images);
  var image = new Image();
  image.src = uri;
  image.className = 'image';
  images.appendChild(image);
  if (window.location.href.indexOf('/autorm/') == '-1') {
    var row = document.createElement('div');
    row.className = 'row';
    viewpage.appendChild(row);
    var col = document.createElement('div');
    col.className = 'col-md-6 col-md-offset-3';
    row.appendChild(col);
    var form = document.createElement('div');
    form.className = 'form-group text-center';
    col.appendChild(form);
    var link = document.createElement('input');
    link.type = 'text';
    link.setAttribute('value', '{{ site.url }}/#!' + id + '!' + pass);
    link.setAttribute('readonly', 'readonly');
    link.className = 'form-control link text-center';
    form.appendChild(link);
    var helpLink = document.createElement('span');
    helpLink.className = 'help-block';
    helpLink.setAttribute('data-l10n', 'link-view');
    helpLink.innerHTML = l('link-view','Link to view image.');
    form.appendChild(helpLink);
    var embed = document.createElement('input');
    embed.type = 'text';
    embed.setAttribute('value', '<img data-imgbi="{{ site.url }}/#!' + id + '!' + pass + '" />');
    embed.setAttribute('readonly', 'readonly');
    embed.className = 'form-control link text-center';
    form.appendChild(embed);
    var helpEmbed = document.createElement('span');
    helpEmbed.className = 'help-block';
    helpEmbed.setAttribute('data-l10n', 'embed');
    helpEmbed.innerHTML = l('embed','Embed image (require <a href="https://img.bi/js">img.bi.js</a>).');
    form.appendChild(helpEmbed);
    if (remove) {
      var removeLink = document.createElement('input');
      removeLink.type = 'text';
      removeLink.setAttribute('value', '{{ site.url }}/rm/#!' + id + '!' + pass + '!' + remove);
      removeLink.setAttribute('readonly', 'readonly');
      removeLink.className = 'form-control link text-center';
      form.appendChild(removeLink);
      var helpRemoveLink = document.createElement('span');
      helpRemoveLink.className = 'help-block';
      helpRemoveLink.setAttribute('data-l10n','link-remove');
      helpRemoveLink.innerHTML = l('link-remove','Link to remove image.');
      form.appendChild(helpRemoveLink);
      var autoRemoveLink = document.createElement('input');
      autoRemoveLink.type = 'text';
      autoRemoveLink.setAttribute('value', '{{ site.url }}/autorm/#!' + id + '!' + pass + '!' + remove);
      autoRemoveLink.setAttribute('readonly', 'readonly');
      autoRemoveLink.className = 'form-control link text-center';
      form.appendChild(autoRemoveLink);
      var helpAutoRemoveLink = document.createElement('span');
      helpAutoRemoveLink.className = 'help-block';
      helpAutoRemoveLink.setAttribute('data-l10n','link-auto-remove');
      helpAutoRemoveLink.innerHTML = l('link-auto-remove','Remove image after first view.');
      form.appendChild(helpAutoRemoveLink);
      var init = document.getElementById('indiesocial-init');
      init.innerHTML = '';
      init.setAttribute('data-URL','{{ site.url }}/#!' + id + '!' + pass);
      indieSocial();
    }
  }
}
function upload(data) {
  for (i in allFiles) {
    var count = parseInt(i) + 1;
    uploadFile(allFiles[i], new XMLHttpRequest(), count);
  }
}
function uploadFile(file, http, count) {
  var url = '{{ site.api }}/upload';
  http.open("POST", url, true);
  http.setRequestHeader("Content-length", file.data.length);
  http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  http.setRequestHeader("Connection", "close");
  http.onreadystatechange = function() {
    if(http.readyState == 4) {
      if (http.status == 200) {
        var uploaded = JSON.parse(http.responseText);
        if (uploaded.status == 'OK') {
          uploadedFiles.push({pass:file.pass,uri:file.uri,id:uploaded.id,remove:uploaded.pass});
          if (allFiles.length == count) {
            showImages();
          }
        }
        else {
          alert(uploaded.status);
        }
      }
      else {
        alert(l('failed-upload','Failed to upload image'));
      }
    }
    
  };
  http.send('encrypted=' + encodeURIComponent(file.data));
}
function changeColor() {
  var colors = ['red', 'green', 'black', 'yellow', 'orange', 'purple', 'grey', 'blue'];
  logo.className = colors[Math.floor(Math.random()*colors.length)];
}
function loadFile(id,pass,autorm) {
  var url = "{{ site.cdn }}" + id;
  var request = new XMLHttpRequest();
  request.open("GET", url);
  request.onload = function() {
    if (request.status == 200) {
      var result = sjcl.decrypt(pass,request.responseText);
      var data = result.match(/^data:(.+);base64,*/);
      if (result) {
        if (acceptedTypes.indexOf(data[1]) != '-1') {
          if (autorm) {
            removeFile(id,autorm,true);
          }
          loading.className = 'hidden';
          showImage(id, pass, result);
          setZoom();
        }
        else {
          alert(data[1] + ': ' + l('filetype','sorry, filetype not supported'));
          window.location = '/';
        }
      }
      else {
        alert(l('failed-decrypt', 'Failed to decrypt image'));
        window.location = '/';
      }
    }
    else {
      alert(l('failed-load','Failed to load image'));
      window.location = '/';
      
    }
  };
  request.send(null);
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

function localizeAll(lang) {
  String.locale = lang;
  var elems = document.querySelectorAll('[data-l10n]');
  for (var i = 0; i < elems.length; ++i) {
    elems[i].innerHTML = l(elems[i].getAttribute('data-l10n'), elems[i].innerHTML);
  }
  document.documentElement.lang = String.locale;
}
function removeFile(id,remove,autorm) {
  var url = "{{ site.api }}/remove?id=" + id + '&password=' + remove;
  var request = new XMLHttpRequest();
  request.open("GET", url);
  request.onload = function() {
    if (request.status == 200) {
      var response = JSON.parse(request.responseText).status;
      if (! autorm) {
        alert(response);
        if (response == 'Success') {
          window.location = '/';
        }
      }
    }
    else {
      alert(l('failed-remove', 'Failed to remove image'));
    }
  };
  request.send(null);
}
if (holder) {
  holder.ondragover = function () {
    this.className = 'hover';
    return false;
  };
  holder.ondragend = function () {
    this.className = '';
    return false;
    hover.innerHTML = '';
  };
  holder.ondrop = function (e) {
    this.className = '';
    e.preventDefault();
    readfiles(e.dataTransfer.files);
  };
  holder.onclick = function() {
    imageUpload.click();
  };
}
if (imageUpload) {
  imageUpload.onchange = function() {
    var oFile = imageUpload.files;
    readfiles(oFile);
  };
}
if (button) {
  button.onclick = function() {
    if (isFiles) {
      upload();
      button.className = 'hidden';
      document.getElementById('uploading').className = 'text-center';
    }
  };
}
if (removeButton) {
  removeButton.onclick = function() {
    var parameters = window.location.hash.split('!');
    removeFile(parameters[1],parameters[3]);
  };
}
if (autormButton) {
  autormButton.onclick = function() {
    var parameters = window.location.hash.split('!');
    document.getElementById('autorm').className = 'hidden';
    loadFile(parameters[1],parameters[2],parameters[3]);
    loading.className = '';
  };
}
logo.onmouseover = function() {
  changeColor();
};

document.getElementById('en').onclick = function() {
  localizeAll('en');
  document.cookie = 'lang=en; expires=Sun, 25 May 2042 00:42:00 UTC; path=/'
};
document.getElementById('ru').onclick = function() {
  localizeAll('ru');
  document.cookie = 'lang=ru; expires=Sun, 25 May 2042 00:42:00 UTC; path=/'
};
document.getElementById('it').onclick = function() {
  localizeAll('it');
  document.cookie = 'lang=it; expires=Sun, 25 May 2042 00:42:00 UTC; path=/'
};
