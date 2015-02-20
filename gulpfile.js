var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

//can do html as well: https://www.npmjs.com/package/gulp-minify-html

gulp.task('scripts', function(){
    gulp.src('src/*.js') //this means *in the root directory and anything with a js extension
    .pipe(concat('all.min.js')) //this will cancatenate all js files into one (I think so that you send one request to the server)
    .pipe(uglify()) //piping in a command that takes in a file provided by the gulp source command - all about streaming
    .pipe(gulp.dest('dist')); //dest = destination (where the minified file will be saved)
});

//to minify run gulp scripts