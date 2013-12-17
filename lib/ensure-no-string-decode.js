'use strict';

/**
 * Ensures that the writable never decodes strings to buffers.
 * It does this by using the API to configure the stream properly, but since that doesn't always work
 * it overrides the _write function as well to ensure that it NEVER pushes 'buffer' encoded chunks.
 * 
 * @name ensureNoStringDecode
 * @private
 * @function
 * @param {Stream} s 
 */
module.exports = function ensureNoStringDecode(s) {
  if (s._writableState) s._writableState.decodeStrings = false;

  // Oh what an ugly hack :( , but somehow just setting decodeStrings fails in cases
  // In particular test/transforms.js: "running trimLeading and then toUpper transforms" fails without this
  var write_ = s._write.bind(s);
  s._write = function (chunk, enc, cb) {
    if (enc === 'utf8') write_(chunk, enc, cb);
    else write_(chunk.toString(), 'utf8', cb);
  }
}
