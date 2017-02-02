var gulp = require('gulp');
var sass = require('gulp-sass');
var del = require('del');

var paths = {
  styles : './**/*'
};

gulp.task('sass', function () {
    return gulp.src('./**/*.scss')
        .pipe(sass({
            // outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(gulp.dest('./builded'));
});

gulp.task('watch', function() {
    gulp.watch(paths.styles, ['sass']);
});

gulp.task('default', ['watch']);