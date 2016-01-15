var gulp = require('gulp-param')(require('gulp'), process.argv);
var jade = require('gulp-jade');
var uglify = require('gulp-uglify');
var less = require('gulp-less');
var concat = require('gulp-concat');
var gettext = require('gulp-angular-gettext');
var gulpif = require('gulp-if');
var ngConstant = require('gulp-ng-constant');
var remember = require('gulp-remember');
var cache = require('gulp-cached');
var newer = require('gulp-newer');
var streamqueue = require('streamqueue');
var rename = require('gulp-rename');
var es = require('event-stream');
var gulpSharp = require('gulp-sharp');


gulp.task('html', function(config) {
  config = JSON.parse(config);
  var languages = require('./frontend/languages.json');
  config.languages = languages;
  return gulp.src('./frontend/**/*.jade')
    .pipe(jade({
      locals: config
    }))
    .pipe(gulp.dest(config.staticContent));
});

gulp.task('js', function(config) {
  config = JSON.parse(config);
  return streamqueue({objectMode: true},
    gulp.src([
      'node_modules/angular/angular.min.js',
      'node_modules/angular-route/angular-route.js',
      'node_modules/angular-gettext/dist/angular-gettext.min.js',
      'node_modules/angular-strap/dist/modules/compiler.min.js',
      'node_modules/angular-strap/dist/modules/dimensions.min.js',
      'node_modules/angular-strap/dist/modules/modal.min.js',
      'node_modules/sjcl/sjcl.js',
      'node_modules/sjcl/core/codecBytes.js',
      'node_modules/clipboard/dist/clipboard.min.js',
      'frontend/locales/*.po',
      'frontend/scripts/*.js'
    ]),
    ngConstant({
      constants: {
        config: {
          acceptedTypes: config.acceptedTypes,
          maxSize: config.maxSize
        }
      },
      stream: true,
      name: 'imgbi.config'
    })
  )
    .pipe(cache('scripts'))
    .pipe(gulpif(/[.]po$/, gettext.compile()))
    .pipe(remember('scripts'))
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(gulp.dest(config.staticContent + '/scripts'));
});

gulp.task('css', function(config) {
  config = JSON.parse(config);
  return gulp.src('frontend/less/main.less')
    .pipe(less({
      paths: [
        'node_modules/bootstrap/less',
        'frontend/less'
      ]
    }))
    .pipe(gulp.dest(config.staticContent + '/css'));
});

gulp.task('favicons', function(config) {
  config = JSON.parse(config);
  return es.merge([
    gulp.src('logo.svg', {read: false})
      .pipe(newer(config.staticContent + '/icons'))
      .pipe(gulpSharp({
        resize: [57],
        max: true,
        output: 'png',
        compressionLevel: 9
      }))
      .pipe(rename('apple-touch-icon-57x57.png'))
      .pipe(gulp.dest(config.staticContent + '/icons')),
    gulp.src('logo.svg', {read: false})
      .pipe(newer(config.staticContent + '/icons'))
      .pipe(gulpSharp({
        resize: [114],
        max: true,
        output: 'png',
        compressionLevel: 9
      }))
      .pipe(rename('apple-touch-icon-114x114.png'))
      .pipe(gulp.dest(config.staticContent + '/icons')),
    gulp.src('logo.svg', {read: false})
      .pipe(newer(config.staticContent + '/icons'))
      .pipe(gulpSharp({
        resize: [72],
        max: true,
        output: 'png',
        compressionLevel: 9
      }))
      .pipe(rename('apple-touch-icon-72x72.png'))
      .pipe(gulp.dest(config.staticContent + '/icons')),
    gulp.src('logo.svg', {read: false})
      .pipe(newer(config.staticContent + '/icons'))
      .pipe(gulpSharp({
        resize: [144],
        max: true,
        output: 'png',
        compressionLevel: 9
      }))
      .pipe(rename('apple-touch-icon-144x144.png'))
      .pipe(gulp.dest(config.staticContent + '/icons')),
    gulp.src('logo.svg', {read: false})
      .pipe(newer(config.staticContent + '/icons'))
      .pipe(gulpSharp({
        resize: [60],
        max: true,
        output: 'png',
        compressionLevel: 9
      }))
      .pipe(rename('apple-touch-icon-60x60.png'))
      .pipe(gulp.dest(config.staticContent + '/icons')),
    gulp.src('logo.svg', {read: false})
      .pipe(newer(config.staticContent + '/icons'))
      .pipe(gulpSharp({
        resize: [120],
        max: true,
        output: 'png',
        compressionLevel: 9
      }))
      .pipe(rename('apple-touch-icon-120x120.png'))
      .pipe(gulp.dest(config.staticContent + '/icons')),
    gulp.src('logo.svg', {read: false})
      .pipe(newer(config.staticContent + '/icons'))
      .pipe(gulpSharp({
        resize: [76],
        max: true,
        output: 'png',
        compressionLevel: 9
      }))
      .pipe(rename('apple-touch-icon-76x76.png'))
      .pipe(gulp.dest(config.staticContent + '/icons')),
    gulp.src('logo.svg', {read: false})
      .pipe(newer(config.staticContent + '/icons'))
      .pipe(gulpSharp({
        resize: [152],
        max: true,
        output: 'png',
        compressionLevel: 9
      }))
      .pipe(rename('apple-touch-icon-152x152.png'))
      .pipe(gulp.dest(config.staticContent + '/icons')),
    gulp.src('logo.svg', {read: false})
      .pipe(newer(config.staticContent + '/icons'))
      .pipe(gulpSharp({
        resize: [196],
        max: true,
        output: 'png',
        compressionLevel: 9
      }))
      .pipe(rename('favicon-196x196.png'))
      .pipe(gulp.dest(config.staticContent + '/icons')),
    gulp.src('logo.svg', {read: false})
      .pipe(newer(config.staticContent + '/icons'))
      .pipe(gulpSharp({
        resize: [160],
        max: true,
        output: 'png',
        compressionLevel: 9
      }))
      .pipe(rename('favicon-160x160.png'))
      .pipe(gulp.dest(config.staticContent + '/icons')),
    gulp.src('logo.svg', {read: false})
      .pipe(newer(config.staticContent + '/icons'))
      .pipe(gulpSharp({
        resize: [96],
        max: true,
        output: 'png',
        compressionLevel: 9
      }))
      .pipe(rename('favicon-96x96.png'))
      .pipe(gulp.dest(config.staticContent + '/icons')),
    gulp.src('logo.svg', {read: false})
      .pipe(newer(config.staticContent + '/icons'))
      .pipe(gulpSharp({
        resize: [16],
        max: true,
        output: 'png',
        compressionLevel: 9
      }))
      .pipe(rename('favicon-16x16.png'))
      .pipe(gulp.dest(config.staticContent + '/icons')),
    gulp.src('logo.svg', {read: false})
      .pipe(newer(config.staticContent + '/icons'))
      .pipe(gulpSharp({
        resize: [32],
        max: true,
        output: 'png',
        compressionLevel: 9
      }))
      .pipe(rename('favicon-32x32.png'))
      .pipe(gulp.dest(config.staticContent + '/icons'))
  ]);
});

gulp.task('fonts', function(config) {
  config = JSON.parse(config);
  return gulp.src('frontend/font/*')
    .pipe(gulp.dest(config.staticContent + '/font'));
});

gulp.task('build', ['css', 'js', 'html', 'favicons', 'fonts']);
