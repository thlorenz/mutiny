'use strict';

module.exports = function toUpper(file, content, cb) {
  cb(null, content.toUpperCase());  
}
