module.exports = function(grunt) {
grunt.initConfig({
  jekyll: {
    web: {
      options: {
        src: 'jekyll',
        dest: 'build',
        config: 'jekyll/_config.yml',
        raw: 'buildfor: web\nurl: https://img.bi'
      }
    },
    tor: {
      options: {
        src: 'jekyll',
        dest: 'build',
        config: 'jekyll/_config.yml',
        raw: 'buildfor: tor\nurl: http://imgbifwwqoixh7te.onion'
      }
    },
    i2p: {
      options: {
        src: 'jekyll',
        dest: 'build',
        config: 'jekyll/_config.yml',
        raw: 'buildfor: i2p\nurl: http://imgbi.i2p'
      }
    },
    local: {
      options: {
        src: 'jekyll',
        dest: 'build',
        config: 'jekyll/_config.yml',
        raw: 'buildfor: web\nurl: http://127.0.0.1:9000'
      }
    },
  },
  clean: ['tmp'],
  less: {
    production: {
      options: {
        paths: ['bower_components/bootstrap/less']
      },
      files: {
        'tmp/main.css': 'less/main.less'
      }
    }
  },
  fontello: {
    dist: {
      options: {
        config  : 'config-fontello.json',
        fonts   : 'build/font',
        styles  : 'tmp',
        scss    : true,
        force   : true
      }
    }
  },
  cssmin: {
    dist: {
      src: ['tmp/main.css', 'tmp/fontello.css', 'tmp/animation.css'],
      dest: 'build/css/main.css'
    }
  },
  min: {
    dist: {
      src: [
        'bower_components/minified/dist/minified.js',
        'bower_components/indiesocial/indiesocial.min.js',
        'bower_components/img.bi.js/img.bi.min.js',
        'bower_components/l10n.js/l10n.min.js',
        'bower_components/sjcl/sjcl.js',
        'build/scripts/main.js'
      ],
      dest: 'tmp/main.js'
    }
  },
  htmlmin: {
    dist: {
      options: {
        collapseWhitespace: true
      },
      files: {
        'build/index.html': 'build/index.html',
        'build/ads/index.html': 'build/ads/index.html',
        'build/apps/index.html': 'build/apps/index.html',
        'build/autorm/index.html': 'build/autorm/index.html',
        'build/contacts/index.html': 'build/contacts/index.html',
        'build/donate/index.html': 'build/donate/index.html',
        'build/js/index.html': 'build/js/index.html',
        'build/rm/index.html': 'build/rm/index.html',
        'build/my/index.html': 'build/my/index.html'
      }
    }
  },
  rename: {
    moveThis: {
      src: 'tmp/main.js',
      dest: 'build/scripts/main.js'
    }
  },
  exec: {
    deploy: {
      cmd: function(addr,dest) {
             return 'rsync --progress -a --delete -e "ssh -q" build/ ' + addr + ':' + dest;
           }
    }
  },
  minjson: {
    compile: {
      files: {
        'build/locales/en.json': 'jekyll/locales/en.json',
        'build/locales/ru.json': 'jekyll/locales/ru.json',
        'build/locales/it.json': 'jekyll/locales/it.json'
      }
    }
  },
  connect: {
    server: {
      options: {
        hostname: '127.0.0.1',
        port: 9000,
        base: 'build',
        middleware: function (connect, options) {
          var proxy = require('grunt-connect-proxy/lib/utils').proxyRequest;
          return [proxy,connect.static(options.base),connect.directory(options.base)];
        }
      },
      proxies: [{
        context: '/api',
        host: '127.0.0.1',
        port: 8080
      }]
    }
  },
  watch: {
    scripts: {
      files: ['jekyll/*', 'less/*', 'bower_components/*', 'config-fontello.json'],
      tasks: ['serve'],
      options: {
        spawn: false,
      }
    },
  },
  mkdir: {
    all: {
      options: {
        mode: 0700,
        create: ['build/download', 'build/download/thumb']
      }
    }
  },
  concat: {
    js: {
      src: [
        'bower_components/minified/dist/minified.js',
        'bower_components/indiesocial/indiesocial.min.js',
        'bower_components/img.bi.js/img.bi.min.js',
        'bower_components/l10n.js/l10n.min.js',
        'bower_components/sjcl/sjcl.js',
        'build/scripts/main.js'
      ],
      dest: 'build/scripts/main.js'
    },
    css: {
      src: ['tmp/main.css', 'tmp/fontello.css', 'tmp/animation.css'],
      dest: 'build/css/main.css'
    }
  }
});

grunt.loadNpmTasks('grunt-contrib-clean');
grunt.loadNpmTasks('grunt-contrib-less');
grunt.loadNpmTasks('grunt-exec');
grunt.loadNpmTasks('grunt-fontello');
grunt.loadNpmTasks('grunt-yui-compressor');
grunt.loadNpmTasks('grunt-jekyll');
grunt.loadNpmTasks('grunt-rename');
grunt.loadNpmTasks('grunt-minjson');
grunt.loadNpmTasks('grunt-contrib-connect');
grunt.loadNpmTasks('grunt-connect-proxy');
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-contrib-htmlmin');
grunt.loadNpmTasks('grunt-mkdir');
grunt.loadNpmTasks('grunt-contrib-concat');

grunt.registerTask('afterjekyll', [ 'less', 'fontello', 'min', 'rename', 'cssmin', 'minjson', 'htmlmin', 'clean' ]);
grunt.registerTask('default', [ 'jekyll:web', 'afterjekyll' ]);
grunt.registerTask('tor', [ 'jekyll:tor', 'afterjekyll' ]);
grunt.registerTask('i2p', [ 'jekyll:i2p', 'afterjekyll' ]);
grunt.registerTask('serve', [ 'jekyll:local', 'less', 'fontello', 'concat', 'mkdir', 'configureProxies:server', 'connect:server', 'watch' ]);
grunt.registerTask('deploy', 'Deploy', function(n) {
  if (grunt.option('web')) {
    grunt.task.run(['default','exec:deploy:' + grunt.option('web')]);
  }
  if (grunt.option('tor')) {
    grunt.task.run(['tor','exec:deploy:' + grunt.option('tor')]);
  }
  if (grunt.option('i2p')) {
    grunt.task.run(['i2p','exec:deploy:' + grunt.option('i2p')]);
  }
});

};
