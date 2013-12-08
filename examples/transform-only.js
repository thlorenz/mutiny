'use strict';

var path = require('path');
var through = require('through2');
var mutiny = require('../');

function toUpper(file, content) {
  return through(
    function (chunk, enc, cb) {
      this.push(chunk.toUpperCase());
      cb();
    }
  )
}

function trimLeading(file, content, cb) {
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

function getStdOut (file) { return process.stdout }

var root = path.join(__dirname, '..', 'test', 'fixtures', 'root');
var transforms = [ toUpper, trimLeading ];

mutiny({ getOutStream: getStdOut, transforms: transforms }, { root: root })
  .on('error', console.error)
  .on('data', function (d) {
    console.log('\nProcessed:\n', d);
    console.log('=====================================================\n');
  })
