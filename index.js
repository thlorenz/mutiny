'use strict';

var readdirp    =  require('readdirp');
var through     =  require('through2');
var PassThrough =  require('stream').PassThrough;
var fs          =  require('fs');
var asyncreduce =  require('asyncreduce');

function contentNpath(entry, enc, cb) {

  // Filter directories
  // We cannot use readdirp directory filter since that would also prevent it from recursing into the filtered directories.
  // Instead we want to allow user to specify these limits, but in the end we are only interested in the files
  if (!entry.stat.isFile()) return cb();

  var self = this;
  var fp = entry.fullPath;

  fs.readFile(fp, 'utf8', function (err, src) {
    if (err) return cb(err);
    self.push({ file: fp, content: src });
    cb();
  });
}


function transformContent(transforms) {
  function runTransforms(entry, enc, cb) {
    var self = this;

    asyncreduce(
        transforms
      , entry
      , function (entry, fn, cb_) {
          fn(entry.file, entry.content,  function (err, content) {
            if (err) return cb_(err);
            entry.content = content;
            cb_(null, entry);
          })
        }
      , function (err, entry) {
          if (err) return cb(err);
          self.push(entry);
          cb();
        }
    )
  }

  function noop (entry, enc, cb) { 
    this.push(entry);
    cb();
  }

  return transforms && transforms.length ? runTransforms : noop;
}

var go = module.exports = function(readopts, transforms, renames) {
  var stream = new PassThrough({ objectMode: true });
  if (transforms) transforms = Array.isArray(transforms) ? transforms : [ transforms ];

  readdirp(readopts)
    .on('warn', stream.emit.bind(stream, 'warn'))
    .on('error', stream.emit.bind(stream, 'error'))
    .pipe(through({ objectMode: true }, contentNpath))
    .pipe(through({ objectMode: true }, transformContent(transforms)))
    .on('error', stream.emit.bind(stream, 'error'))
    .pipe(stream);

  return stream;
};

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

function toUpper(file, content, cb) {
  cb(null, content.toUpperCase());  
}

function trimLeading(file, content, cb) {
  var c = content.replace(/^\s+/mg, '');
  //cb(new Error('oh my god'));
  cb(null, c);
}

// Test
if (!module.parent && typeof window === 'undefined') {
  var path = require('path');
  var root = path.join(__dirname, 'test', 'fixtures', 'root');
  go({ root: root }, [ toUpper, trimLeading ])
    .on('data', function (data) {
      console.log('data', data);  
    })
    .on('error', function (err) {
      console.error('error', err); 
    });
}
