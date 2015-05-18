module.exports = function(grunt) {
grunt.initConfig({
  clean: {
    tmp: {
      src: ['tmp']
    },
    build: {
      src: ['build']
    }
  },
  less: {
    production: {
      options: {
        paths: ['bower_components/bootstrap/less']
      },
      files: {
        'tmp/main.css': 'src/less/main.less'
      }
    }
  },
  cssmin: {
    combine: {
      files: {
        'build/css/main.css': ['tmp/main.css', 'tmp/icons.css']
      }
    }
  },
  uglify: {
    options: {
      mangle: false
    },
    main: {
      files: {
        'build/scripts/main.js': [
          'bower_components/zeroclipboard/dist/ZeroClipboard.min.js',
          'bower_components/angular/angular.min.js',
          'bower_components/angular-route/angular-route.js',
          'bower_components/angular-gettext/dist/angular-gettext.min.js',
          'bower_components/angular-strap/dist/modules/dimensions.min.js',
          'bower_components/angular-strap/dist/modules/modal.min.js',
          'tmp/config.js',
          'tmp/translations.js',
          'bower_components/sjcl/sjcl.js',
          'src/scripts/*.js'
        ]
      }
    }
  },
  htmlmin: {
    dist: {
      options: {
        collapseWhitespace: true
      },
      files: {
        'build/index.html': 'src/index.html',
        'build/partials/kokoku.html': 'src/partials/kokoku.html',
        'build/partials/apps.html': 'src/partials/apps.html',
        'build/partials/autorm.html': 'src/partials/autorm.html',
        'build/partials/contacts.html': 'src/partials/contacts.html',
        'build/partials/donate.html': 'src/partials/donate.html',
        'build/partials/js.html': 'src/partials/js.html',
        'build/partials/my.html': 'src/partials/my.html',
        'build/partials/rm.html': 'src/partials/rm.html',
        'build/partials/upload.html': 'src/partials/upload.html',
        'build/partials/view.html': 'src/partials/view.html',
        'build/partials/modal.tpl.html': 'src/partials/modal.tpl.html',
        'build/autorm/index.html': 'src/autorm/index.html',
        'build/rm/index.html': 'src/rm/index.html'
      }
    }
  },
  exec: {
    deploy: {
      cmd: function(addr,dest) {
             return 'torsocks rsync --progress -a --delete -e "ssh -q" build/ ' + addr + ':' + dest;
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
      files: ['src/**/*'],
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
  copy: {
    serve: {
      files: [{
        expand: true,
        src: '**/*.html',
        cwd: 'src/',
        dest: 'build/',
      }]
    },
    build: {
      files: [{
        expand: true,
        src: ['key.gpg'],
        cwd: 'src/',
        dest: 'build/',
      },
      {
        src: 'bower_components/zeroclipboard/dist/ZeroClipboard.swf',
        dest: 'build/ZeroClipboard.swf'
      }]
    }
  },
  concat: {
    js: {
      src: [
        'bower_components/zeroclipboard/dist/ZeroClipboard.min.js',
        'bower_components/angular/angular.min.js',
        'bower_components/angular-route/angular-route.js',
        'bower_components/angular-gettext/dist/angular-gettext.min.js',
        'bower_components/angular-strap/dist/modules/dimensions.min.js',
        'bower_components/angular-strap/dist/modules/modal.min.js',
        'tmp/config.js',
        'tmp/translations.js',
        'bower_components/sjcl/sjcl.js',
        'src/scripts/*.js'
      ],
      dest: 'build/scripts/main.js'
    },
    css: {
      src: ['tmp/main.css', 'tmp/icons.css'],
      dest: 'build/css/main.css'
    }
  },
  compress: {
    main: {
      options: {
        mode: 'gzip',
        level: 9
      },
      expand: true,
      cwd: 'build/',
      dest: 'build/',
      src: ['**/*']
    }
  },
  hashres: {
    options: {
      fileNameFormat: '${hash}-${name}.${ext}',
    },
    icons: {
      src: [
        'build/font/*'
      ],
      dest: [
        'build/css/main.css'
      ]
    },
    prod: {
      src: [
        'build/css/main.css',
        'build/scripts/main.js',
        'build/*.png'
      ],
      dest: [
        'build/index.html',
        'build/partials/*.html'
      ]
    }
  },
  jshint: {
    all: ['Gruntfile.js', 'src/scripts/*.js', 'tests/*.js']
  },
  jsonlint: {
    all: {
      src: [ '*.json' ]
    }
  },
  htmllint: {
    all: {
      src: ['src/**/*.html']
    }
  },
  nggettext_compile: {
    all: {
      files: {
        'tmp/translations.js': ['src/locales/*.po']
      }
    },
  },
  nggettext_extract: {
    pot: {
      files: {
        'src/locales/template.pot': ['src/**/*.html', 'src/scripts/*.js']
      }
    },
  },
  ngconstant: {
    web: {
      options: {
        dest: 'tmp/config.js',
        name: 'imgbi.config',
      },
      constants: {
        config: grunt.file.readJSON('config.json'),
        url: grunt.file.readJSON('config.json').clearnet
      }
    },
    i2p: {
      options: {
        dest: 'tmp/config.js',
        name: 'imgbi.config',
      },
      constants: {
        config: grunt.file.readJSON('config.json'),
        url: grunt.file.readJSON('config.json').i2p
      }
    },
    tor: {
      options: {
        dest: 'tmp/config.js',
        name: 'imgbi.config',
      },
      constants: {
        config: grunt.file.readJSON('config.json'),
        url: grunt.file.readJSON('config.json').tor
      }
    },
    local: {
      options: {
        dest: 'tmp/config.js',
        name: 'imgbi.config',
      },
      constants: {
        config: grunt.file.readJSON('config.json'),
        url: 'http://127.0.0.1:9000'
      }
    },
  },
  webfont: {
    icons: {
      src: [
        'bower_components/awesome-uni.font/src/svg/spinner.svg',
        'bower_components/awesome-uni.font/src/svg/mail.svg',
        'bower_components/awesome-uni.font/src/svg/key.svg',
        'bower_components/awesome-uni.font/src/svg/github-circled.svg',
        'bower_components/awesome-uni.font/src/svg/spinner.svg',
        'bower_components/awesome-uni.font/src/svg/twitter.svg',
        'bower_components/awesome-uni.font/src/svg/link.svg'
      ],
      dest: 'build/font',
      destCss: 'tmp',
      options: {
        hashes: false,
        syntax: 'bootstrap',
        htmlDemo: false,
        relativeFontPath: '../font',
      }
    }
  },
  multiresize: {
    main: {
      src: 'logo.svg',
      dest: [
        'build/icons/apple-touch-icon-57x57.png',
        'build/icons/apple-touch-icon-114x114.png',
        'build/icons/apple-touch-icon-72x72.png',
        'build/icons/apple-touch-icon-144x144.png',
        'build/icons/apple-touch-icon-60x60.png',
        'build/icons/apple-touch-icon-120x120.png',
        'build/icons/apple-touch-icon-76x76.png',
        'build/icons/apple-touch-icon-152x152.png',
        'build/icons/favicon-196x196.png',
        'build/icons/favicon-160x160.png',
        'build/icons/favicon-96x96.png',
        'build/icons/favicon-16x16.png',
        'build/icons/favicon-32x32.png',
      ],
      destSizes: [
        '57x57',
        '114x114',
        '72x72',
        '144x144',
        '60x60',
        '120x120',
        '76x76',
        '152x152',
        '196x196',
        '160x160',
        '96x96',
        '16x16',
        '32x32'
      ]
    }
  },
  karma: {  
    unit: {
      options: {
        frameworks: ['jasmine'],
        singleRun: true,
        browsers: ['PhantomJS'],
        reporters: 'spec',
        files: [
          'bower_components/angular/angular.min.js',
          'bower_components/angular-mocks/angular-mocks.js',
          'bower_components/sjcl/sjcl.js',
          'src/scripts/*.js',
          'tests/*.js'
        ]
      }
    }
  }
});

grunt.loadNpmTasks('grunt-contrib-clean');
grunt.loadNpmTasks('grunt-contrib-less');
grunt.loadNpmTasks('grunt-exec');
grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-contrib-connect');
grunt.loadNpmTasks('grunt-connect-proxy');
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-contrib-htmlmin');
grunt.loadNpmTasks('grunt-mkdir');
grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-contrib-compress');
grunt.loadNpmTasks('grunt-hashres');
grunt.loadNpmTasks('grunt-contrib-copy');
grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-jsonlint');
grunt.loadNpmTasks('grunt-angular-gettext');
grunt.loadNpmTasks('grunt-ng-constant');
grunt.loadNpmTasks('grunt-contrib-cssmin');
grunt.loadNpmTasks('grunt-webfont');
grunt.loadNpmTasks('grunt-multiresize');
grunt.loadNpmTasks('grunt-karma');

grunt.registerTask('afterall', [ 'clean:build', 'less', 'webfont', 'multiresize', 'nggettext_compile', 'uglify', 'cssmin', 'htmlmin', 'copy:build', 'clean:tmp' ]);
grunt.registerTask('default', [ 'ngconstant:web', 'afterall' ]);
grunt.registerTask('tor', [ 'ngconstant:tor', 'afterall' ]);
grunt.registerTask('i2p', [ 'ngconstant:i2p', 'afterall' ]);
grunt.registerTask('extract', [ 'nggettext_extract' ]);
grunt.registerTask('serve', [ 'clean:build', 'less', 'webfont', 'multiresize', 'nggettext_compile', 'ngconstant:local', 'concat', 'mkdir', 'copy', 'configureProxies:server', 'connect:server', 'watch', 'clean:tmp']);
grunt.registerTask('test', [ 'jshint', 'jsonlint', 'karma' ]);
grunt.registerTask('deploy', 'Deploy', function(n) {
  if (grunt.option('web')) {
    grunt.task.run(['default', 'hashres', 'compress', 'exec:deploy:' + grunt.option('web')]);
  }
  if (grunt.option('tor')) {
    grunt.task.run(['tor', 'hashres', 'compress', 'exec:deploy:' + grunt.option('tor')]);
  }
  if (grunt.option('i2p')) {
    grunt.task.run(['i2p', 'hashres', 'compress', 'exec:deploy:' + grunt.option('i2p')]);
  }
});
};
