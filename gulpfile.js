var gulp = require('gulp'), concat = require('gulp-concat'), sass = require('gulp-sass');

gulp.task('default', function() {
  // place code for your default task here
  gulp.run(['scripts', 'sass','sass:watch','scripts:watch'])
});
 
gulp.task('scripts', function() {
  return gulp.src('src/js/*.js')
    .pipe(concat('app.js'))
    .pipe(gulp.dest('./dist/'));
});
 
gulp.task('sass', function () {
  return gulp.src('src/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dist')); 
});
 
gulp.task('sass:watch', function () {
    gulp.watch('src/**/*.scss', ['sass']);
});

gulp.task('scripts:watch', function () {
    gulp.watch('src/**/*.js', ['scripts']);
});