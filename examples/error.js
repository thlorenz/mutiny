'use strict';

var path = require('path');
var through = require('through2');
var mutiny = require('../');

function toUpper(file) {
  return through(
    function (chunk, enc, cb) {
      if ((/two/mg).test(chunk)) return cb(new Error('I hate to be number two!'));
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
var transform = [ toUpper, trimLeading ];

function getStdOut (file) { return process.stdout }

var root = path.join(__dirname, '..', 'test', 'fixtures', 'root');
var transform = [ toUpper, trimLeading ];

mutiny({ getOutStream: getStdOut, transform: transform }, { root: root })
  .on('error', console.error)
  .on('data', function (d) {
    console.log('\nProcessed:\n', d);
    console.log('=====================================================\n');
  })
