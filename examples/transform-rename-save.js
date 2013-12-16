'use strict';

var path = require('path');
var through = require('through2');
var mutiny = require('../');

function toUpper(file) {
  return through(
    function (chunk, enc, cb) {
      this.push(chunk.toUpperCase());
      cb();
    }
  )
}

function trimLeading(file) {
  var data = '';

  function ondata(chunk, enc, cb) {
    data += chunk;
    cb();
  }

  function onend(cb) {
    var c = data.replace(/^\s+/mg, '');
    this.push(c);
    cb();
  }

  return through(ondata, onend);
}

var root = path.join(__dirname, '..', 'test', 'fixtures', 'root');
var outdir = path.join(__dirname, 'out.transform-save-rename');
var transform = [ toUpper, trimLeading ];

function rename(outfile, outdir, relative) {
  var extlen = path.extname(outfile).length;
  return outfile.slice(0, -extlen) + '.md';
}

// Our filter ensures we only transform html files
// Our rename function changes the extension of all files from .html to .md
// In case more control is needed, we can override the getOutStream function to direct the output to wherever we want
mutiny({ outdir: outdir, rename: rename, transform: transform }, { root: root, fileFilter: '*.html' })
  .on('error', console.error)
  .on('data', function (d) {
    console.log('\nProcessed:\n', d);
  })
