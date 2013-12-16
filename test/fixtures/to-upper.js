var through = require('through2');

module.exports = function toUpper(file) {
  return through(
    function (chunk, enc, cb) {
      this.push(chunk.toUpperCase());
      cb();
    }
  )
}
