const del = require('del');
const gulp = require('gulp');
const path = require('path');
const sourcemaps = require('gulp-sourcemaps');
const ts = require('gulp-typescript');

const project = ts.createProject('tsconfig.json');

gulp.task('default', ['build']);

gulp.task('build', function() {
    del.sync(['dist/**/*.*']);

    const compile = gulp
        .src('src/**/*.ts')
        .pipe(sourcemaps.init({ base: 'src' }))
        .pipe(project());

    compile.pipe(gulp.dest('dist'));

    gulp.src('src/**/*.js').pipe(gulp.dest('dist'));
    gulp.src('src/**/*.json').pipe(gulp.dest('dist'));

    return compile.js
        .pipe(sourcemaps.mapSources(src => path.join(__dirname, 'src', src)))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', ['build'], () => {
    gulp.watch('src/**/*.{ts,js}', ['build']);
});
