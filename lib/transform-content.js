'use strict';

var fs       =  require('fs')
  , through  =  require('through2')
  , combine  =  require('stream-combiner')

var ensureNoStringDecode = require('./ensure-no-string-decode')

function transformStream(progress, transforms) {
  return transforms && transforms.length
    ? function (file) {
        var streams = transforms.map(function (t) { 
          var s = t(file);
          ensureNoStringDecode(s);
          return s;
        });

        var combined = combine.apply(null, streams);
        return combined;
      }
    : function (file) { return through() };
}

/**
 * Runs all transforms on the content of all files that are piped into its file stream.
 * Reports progress by pushing into the @see progress stream.
 * 
 * @name transformContent
 * @function
 * @param {Stream} progress into which progress data is pushed
 * @param {Array.<function(String):Stream>} transforms functions that return a transform stream when invoked with a path to a file
 *  - signature of each transform: `function ({String} file) : {TransformStream}`
 */
module.exports = function transformContent(progress, transforms) {
  var ts = transformStream(progress, transforms);
  return function (entry, enc, cb) {
    var self = this;

    fs.createReadStream(entry.file, { encoding: 'utf8' })
      .on('error', cb)
      .pipe(ts(entry.file))
      .on('error', cb)
      .on('end', function () { 
        self.push({ file: entry.file, outfile: entry.outfile });
        cb();
      })
      .pipe(entry.outStream);
  }
}
