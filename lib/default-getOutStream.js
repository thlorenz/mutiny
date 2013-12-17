'use strict';

var fs       =  require('fs')
  , path     =  require('path')
  , through  =  require('through2')
  , mkdirp   =  require('mkdirp')

/**
 * The default function used to get the outStream.
 * When implementing a custom getOutStream function it needs to have the same signature.
 *
 * @name defaultGetOutStream
 * @function
 * @private
 * @param {String} outfile the full path to the file (after the rename function ran) to stream the data into 
 * @param {String} outdir the root of the directory to which all files are output
 * @param {String} relative the path to the @see outfile relative to the @see outdir
 * @return {Stream} and output stream
 */
module.exports = function defaultGetOutStream(outfile, outdir, relative) {
  var dir = path.dirname(outfile)
    , stream = through();

  mkdirp(dir, function (err) {
    if (err) return stream.emit('error', err);

    var out = fs.createWriteStream(outfile, { encoding:'utf8' })
    stream
      .pipe(out)
      .on('error', stream.emit.bind(stream, 'error'))
  });

  return stream;
}
