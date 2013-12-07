'use strict';

var readdirp =  require('readdirp')
  , fs       =  require('fs')
  , path     =  require('path')
  , through  =  require('through2')
  , combine  =  require('stream-combiner')
  , mkdirp   =  require('mkdirp')

var PassThrough =  require('stream').PassThrough || (
  function () { 
    try {
      return require('readable-stream').PassThrough;
    } catch (e) {
      console.error('You are using a version of node whose streams are incompatible with mutiny.');
      console.error('As a workaround please: npm install readable-stream');
      process.exit(1);
    }
  })();

function outForFiles(getOutStream, outdir) {
  // Filter directories
  // We cannot use readdirp directory filter since that would also prevent it from recursing into the filtered directories.
  // Instead we want to allow user to specify these limits, but in the end we are only interested in the files

  return function(entry, enc, cb) {
    if (!entry.stat.isFile()) return cb();

    var outfile = outdir ? path.join(outdir, entry.path) : null
      , outStream = getOutStream(outfile, outdir, entry.relative);

    this.push({ file: entry.fullPath, outStream: outStream });
    cb();
  }
}

function transformStream(transforms) {
  return transforms && transforms.length
    ? function (file) {
        var streams = transforms.map(function (t) { return t(file) });
        var combined = combine.apply(null, streams);
        combined._writableState.decodeStrings = false;
        return combined;
      }
    : function (file) { return through() };
}

function transformContent(transforms) {
  var ts = transformStream(transforms);
  return function (entry, enc, cb) {
    fs.createReadStream(entry.file, { encoding: 'utf8' })
      .on('error', cb)
      .pipe(ts(entry.file))
      .on('error', cb)
      .on('end', cb)
      .pipe(entry.outStream);
  }
}

function getOutStreamFor(rename, outfile, outdir, relative) {
  outfile = rename(outfile); 
  var dir = path.dirname(outfile)
    , stream = new PassThrough();

  mkdirp(dir, function (err) {
    if (err) return stream.emit('error', err);

    var out = fs.createWriteStream(outfile, { encoding:'utf8' })
    stream
      .pipe(out)
      .on('error', stream.emit.bind(stream, 'error'))
  });

  return stream;
}

function keepName(outfile, outdir, relative) { return outfile }

var go = module.exports = function(mutinyopts, readopts) {
  var transforms
    , outdir = mutinyopts.outdir
    , stream = new PassThrough({ objectMode: true });

  readopts = readopts || {}

  if (!outdir && !mutinyopts.getOutStream) {
    stream.emit('error', new Error('Need to supply the outdir option (full path to where to store transformed files) or provide custom outStream function.'));
  }

  if (mutinyopts.getOutStream && mutinyopts.rename) {
    stream.emit('error', new Error('If you already supply the outstream it doesn\'t make any sense to also supply a rename function'));
  }

  var rename = mutinyopts.rename || keepName;
  var getOutStream = mutinyopts.getOutStream || getOutStreamFor.bind(null, rename)

  if (mutinyopts.transforms) {
    transforms = Array.isArray(mutinyopts.transforms) ? mutinyopts.transforms : [ mutinyopts.transforms ];
  }

  readdirp(readopts)
    .on('warn', stream.emit.bind(stream, 'warn'))
    .on('error', stream.emit.bind(stream, 'error'))
    .pipe(through({ objectMode: true }, outForFiles(getOutStream, outdir)))
    .on('error', stream.emit.bind(stream, 'error'))
    .pipe(through({ objectMode: true }, transformContent(transforms)))
    .on('error', stream.emit.bind(stream, 'error'))
    .pipe(stream);

  return stream;
};

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

function toUpper(file, content) {
  return through(
    function (chunk, enc, cb) {
      this.push(chunk.toUpperCase());
      cb();
    }
  )
}

function trimLeading(file, content, cb) {
  var c = content.replace(/^\s+/mg, '');
  cb(null, c);
}

function getStdOut () { return process.stdout }

// Test
if (!module.parent && typeof window === 'undefined') {
  var path = require('path');
  var fixtures = path.join(__dirname, 'test', 'fixtures')
  var root = path.join(fixtures, 'root');
  var outdir = path.join(fixtures, 'out');


  go({ transforms: [ toUpper ], outdir: outdir }, { root: root })
    .on('data', function (data) {
      console.log('data', data);  
    })
    .on('error', function (err) {
      console.error('error', err); 
    });
}
