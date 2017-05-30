'use strict';

import path from 'path';

export default function(gulp, plugins, args, config, taskTarget, browserSync) {
  let dirs = config.directories;

  //css lint
  gulp.task('lint-css', function lintCssTask() {
    const gulpStylelint = require('gulp-stylelint');

    return gulp
        .src(path.join(dirs.source, dirs.styles, entries.css))
        .pipe(gulpStylelint({
            reporters: [
                {
                    formatter: 'string', console: true
                }
            ]
        }));
  });
}