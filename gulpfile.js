var gulp = require('gulp');
var imagemin = require('gulp-imagemin');
var rename = require('gulp-rename');
var cssmin = require('gulp-cssmin');
var uglify = require('gulp-uglify');
var critical = require('critical');
var minifyHTML = require('gulp-minify-html');
var runSequence = require('run-sequence');
var del = require('del');

gulp.task('uglify-home', function() {
  return gulp.src('src/js/*.js')
  .pipe(uglify())
  .pipe(gulp.dest('dist/js'));
});

gulp.task('cssmin-home', function() {
  return gulp.src('src/css/*.css')
  .pipe(cssmin())
  .pipe(gulp.dest('dist/css'));
});

gulp.task('imagemin-home', function() {
  return gulp.src('src/img/*')
    .pipe(imagemin({
      progressive: true,
      interlaced: true,
      multipass: true
    }))
    .pipe(gulp.dest('dist/img'));
});

gulp.task('uglify-views', function() {
  return gulp.src('src/views/js/*.js')
  .pipe(uglify())
  .pipe(gulp.dest('dist/views/js'));
});

gulp.task('cssmin-views', function() {
  return gulp.src('src/views/css/*.css')
  .pipe(cssmin())
  .pipe(gulp.dest('dist/views/css'));
});

gulp.task('imagemin-views', function() {
  return gulp.src('src/views/images/*')
    .pipe(imagemin({
      progressive: true,
      interlaced: true,
      multipass: true
    }))
    .pipe(gulp.dest('dist/views/images'));
});

gulp.task('copy-home', function() {
	return gulp.src([
      'src/project-2048.html',
      'src/project-webperf.html',
      'src/project-mobile.html'
    ])
	.pipe(gulp.dest('dist'));
});

gulp.task('copy-views', function() {
	return gulp.src('src/views/*.html')
	.pipe(gulp.dest('dist/views'));
});

gulp.task('critical', ['build-clean'], function () {
  critical.generate({
  	inline: true,
    base: './src/',
    src: 'index.html',
    css: ['src/css/style.css'],
    dimensions: [{
      width: 1280,
      height: 960
    }],
    dest: 'src/index-critical.html',
    minify: true,
    extract: false
  });
});

gulp.task('minify-html', ['critical'], function() {
  var opts = {
    conditionals: true
  };
 
  return gulp.src('src/index-critical.html')
    .pipe(minifyHTML(opts))
    .pipe(rename('index.html'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('build-clean', function() {
    del('dist');
});

gulp.task('default', function(callback) {
  runSequence('minify-html',
              ['imagemin-home', 'cssmin-home', 'cssmin-views', 'uglify-home', 'uglify-views', 'copy-home', 'copy-views', 'imagemin-views'],
              callback);
});


