'use-strict';

const {
  src, dest, watch, series,
} = require('gulp');
const minifyCSS = require('gulp-csso');
const htmlmin = require('gulp-htmlmin');
const size = require('gulp-size');
const del = require('del');
const fs = require('fs');
const workboxBuild = require('workbox-build');

const sizeFactory = (title) => size({
  title,
  showFiles: true,
});

const sw = () => {
  return workboxBuild.injectManifest({
    swSrc: 'app/sw.js',
    swDest: 'dist/sw.js',
    globDirectory: 'dist',
    globPatterns: [
      '**\/*.{js,css,html,svg,ico}',
    ],
    globIgnores: [
      '404.html',
    ],
  }).then(({count, size: finalSize, warnings}) => {
    warnings.forEach(console.warn);
    console.log(`${count} files will be precached, totaling ${finalSize} bytes.`);
  });
};

const html = () => {
  return src('app/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(sizeFactory('html'))
    .pipe(dest('dist/'));
};

const static = () => {
  return src('app/static/**')
    .pipe(sizeFactory('static'))
    .pipe(dest('dist/static'));
};

const assets = () => {
  return src('app/assets/**')
    .pipe(sizeFactory('assets'))
    .pipe(dest('dist/assets'));
};

const copy = () => {
  return src(['app/manifest.json', 'app/favicon.ico'])
    .pipe(dest('dist/'));
};

const css = () => {
  return src('app/css/*.css')
    .pipe(minifyCSS())
    .pipe(sizeFactory('css'))
    .pipe(dest('dist/css'));
};

const watcher = () => {
  return watch('/app', series(clean, html, css, assets, static, copy));
};

const clean = (cb) => {
  if (fs.existsSync('/dist')) {
    del.sync('/dist');
  }
  cb();
};;

exports.css = css;
exports.html = html;
exports.watcher = watcher;
exports.clean = clean;
exports.default = series(clean, html, css, assets, static, copy, sw);