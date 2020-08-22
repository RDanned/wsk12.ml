var gulp        = require('gulp');
var browserSync = require('browser-sync');

gulp.task('browser-sync', function() {
    browserSync({
        server: {
            baseDir: './'
        },
        notify: false,
    });
});

gulp.task('watch', function() {
    browserSync({
        server: {
            baseDir: './'
        },
        notify: false,
    });

    // gulp.watch('assets/css/*.css', browserSync.reload);
    // gulp.watch('assets/js/*.js', browserSync.reload);
    gulp.watch('assets/css/*.css').on('change', browserSync.reload);
    gulp.watch('assets/js/*.js').on('change', browserSync.reload);
    //gulp.watch(['assets/libs/**/*.js', 'app/js/common.js'], ['js']);
    //gulp.watch('./*.html', browserSync.reload);
    gulp.watch('./*.html').on('change', browserSync.reload);
});