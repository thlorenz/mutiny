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
var outdir = path.join(__dirname, 'out.transform-save');
var transform = [ toUpper, trimLeading ];


// not supplying custom getOutStream and no rename function will just save the files to the outdir
mutiny({ outdir: outdir, transform: transform }, { root: root })
  .on('error', console.error)
  .on('data', function (d) {
    console.log('\nProcessed:\n', d);
  })
