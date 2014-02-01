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
    }
  },
  clean: ['tmp'],
  less: {
    production: {
      options: {
        paths: ['bower_components/bootstrap/less']
      },
      files: {
        'jekyll/css/main.css': 'less/main.less'
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
      src: ['jekyll/css/main.css', 'tmp/fontello.css', 'tmp/animation.css'],
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
        'build/rm/index.html': 'build/rm/index.html'
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
        port: 9000,
        base: 'build'
      }
    }
  },
  watch: {
    scripts: {
      files: ['*'],
      tasks: ['serve'],
      options: {
        spawn: false,
      }
    },
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
grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-contrib-htmlmin');

grunt.registerTask('default', [ 'less', 'jekyll:web', 'fontello', 'min', 'rename', 'cssmin', 'minjson', 'htmlmin', 'clean' ]);
grunt.registerTask('tor', [ 'less', 'jekyll:tor', 'fontello', 'min', 'rename', 'cssmin', 'minjson', 'htmlmin', 'clean' ]);
grunt.registerTask('i2p', [ 'less', 'jekyll:i2p', 'fontello', 'min', 'rename', 'cssmin', 'minjson', 'htmlmin', 'clean' ]);
grunt.registerTask('serve', [ 'default', 'connect', 'watch' ]);
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
