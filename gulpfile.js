/**
 * Created by smskin on 22.12.16.
 */

var gulp = require('gulp');
var minify = require('gulp-minify');

gulp.task('default', function() {
    gulp.src('src/*.js')
        .pipe(minify({
            ext:{
                min:'.min.js'
            },
            ignoreFiles: ['.min.js']
        }))
        .pipe(gulp.dest('dist'))
});