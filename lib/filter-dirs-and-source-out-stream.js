'use strict';

var path = require('path')

/**
 * Filters all directories, applies rename and sources the out stream.
 *
 * @note
 *    We cannot use readdirp directory filter since that would also prevent it from recursing into the filtered directories.
 *    Instead we want to allow user to specify these limits, but in the end we are only interested in the files
 * 
 * @name filterDirsAndSourceOutStream
 * @private
 * @function
 * @param {Function} getOutStream function ({String} outfile, {String} outdir, {String} relativeOutfile) : {WritableStream} outstream
 * @param {Function} rename function({String} outfile) : {String} renamedOutfile
 * @param {String} outdir root of output directory
 */
module.exports = function filterDirsAndSourceOutStream(getOutStream, rename, outdir) {
  return function(entry, enc, cb) {
    if (!entry.stat.isFile()) return cb();

    try {
      var outfile = outdir ? path.join(outdir, entry.path) : null
        , renamedOutfile = rename(outfile)
        , outStream = getOutStream(renamedOutfile, outdir, entry.relative);

      this.push({ file: entry.fullPath, outfile: renamedOutfile, outStream: outStream });
      cb();
    } catch (err) {
      cb(err);
    }
  }
}
