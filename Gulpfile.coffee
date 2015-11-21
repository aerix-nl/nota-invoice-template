gulp            = require 'gulp'
gutil           = require 'gulp-util'
gulpLoadPlugins = require 'gulp-load-plugins'
plugins         = gulpLoadPlugins()
fs              = require 'fs'
jsonSass        = require 'json-sass'

coffeeSrc = './coffee/**/*.coffee'
sassSrc = './sass/**/*.sass'
notaSrc = './nota.json'

sassIncludes = [].concat(require('node-neat').includePaths,
  ['bower_components/material-design-lite/src/'])

gulp.task 'coffee', ->
  gulp.src coffeeSrc
  .pipe plugins.sourcemaps.init()
  .pipe plugins.coffee({bare: true}).on('error', gutil.log)
  .pipe plugins.sourcemaps.write()
  .pipe gulp.dest './dist/js/'

gulp.task 'sass', ['json-sass'], ->
  options =
    includePaths: sassIncludes

  gulp.src sassSrc
  .pipe plugins.sourcemaps.init()
  .pipe plugins.sass(options).on('error', plugins.sass.logError)
  .pipe plugins.sourcemaps.write()
  .pipe gulp.dest './dist/css/'

gulp.task 'json-sass', ->
  gulp.src notaSrc
    .pipe plugins.modify
      fileModifier: (file, json)->
        '$paper-size: ' + jsonSass.convertJs(JSON.parse(json).paperSize)
    .pipe plugins.rename('paper-size.scss')
    .pipe gulp.dest('./sass/')

gulp.task 'watch', ->
  gulp.watch coffeeSrc, ['coffee']
  gulp.watch sassSrc,   ['sass']
  gulp.watch notaSrc,   ['sass']

gulp.task 'build', ['coffee', 'sass', 'watch']

gulp.task 'release', ['clean']

gulp.task 'default', ['build']