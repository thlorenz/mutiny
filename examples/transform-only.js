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

function getStdOut (file) { return process.stdout }

var root = path.join(__dirname, '..', 'test', 'fixtures', 'root');
var transform = [ toUpper, trimLeading ];

// we are overriding the getOutStream to redirect all output to stdout instead of saving to a file
mutiny({ getOutStream: getStdOut, transform: transform }, { root: root })
  .on('error', console.error)
  .on('data', function (d) {
    console.log('\nProcessed:\n', d);
    console.log('=====================================================\n');
  })
