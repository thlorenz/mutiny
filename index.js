'use strict';

var readdirp =  require('readdirp')
  , fs       =  require('fs')
  , path     =  require('path')
  , through  =  require('through2')
  , combine  =  require('stream-combiner')
  , mkdirp   =  require('mkdirp')

function outForFiles(getOutStream, rename, outdir) {
  // Filter directories
  // We cannot use readdirp directory filter since that would also prevent it from recursing into the filtered directories.
  // Instead we want to allow user to specify these limits, but in the end we are only interested in the files

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

function ensureNoStringDecode(s) {
  if (s._writableState) s._writableState.decodeStrings = false;

  // Oh what an ugly hack :( , but somehow just setting decodeStrings fails in cases
  // In particular test/transforms.js: "running trimLeading and then toUpper transforms" fails without this
  var write_ = s._write.bind(s);
  s._write = function (chunk, enc, cb) {
    if (enc === 'utf8') write_(chunk, enc, cb);
    else write_(chunk.toString(), 'utf8', cb);
  }
}

function transformStream(progress, transforms) {
  function onerror(err) {
    progress.emit('error', err);
  }

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

function transformContent(progress, transforms) {
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

function defaultGetOutStream(outfile, outdir, relative) {
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

function keepName(outfile, outdir, relative) { return outfile }

var go = module.exports = function(mutinyopts, readopts) {
  var transforms
    , outdir = mutinyopts.outdir
    , progress = through({ objectMode: true });

  readopts = readopts || {}

  if (!outdir && !mutinyopts.getOutStream) {
    progress.emit('error', new Error('Need to supply the outdir option (full path to where to store transformed files) or provide custom outStream function.'));
  }

  if (mutinyopts.getOutStream && mutinyopts.rename && !mutinyopts.__allow_out_and_rename__) {
    progress.emit('error', new Error('If you already supply the outstream it doesn\'t make any sense to also supply a rename function'));
  }

  var rename = mutinyopts.rename || keepName;
  var getOutStream = mutinyopts.getOutStream || defaultGetOutStream 

  if (mutinyopts.transforms) {
    transforms = Array.isArray(mutinyopts.transforms) ? mutinyopts.transforms : [ mutinyopts.transforms ];
  }

  readdirp(readopts)
    .on('warn', progress.emit.bind(progress, 'warn'))
    .on('error', progress.emit.bind(progress, 'error'))
    .pipe(through({ objectMode: true }, outForFiles(getOutStream, rename, outdir)))
    .on('error', progress.emit.bind(progress, 'error'))
    .pipe(through({ objectMode: true }, transformContent(progress, transforms)))
    .on('error', progress.emit.bind(progress, 'error'))
    .pipe(progress);

  return progress;
};

// 
// Test
//
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

function toUpperError(file, content, cb) {
  return through(
    function (chunk, enc, cb) {
      if ((/two/mg).test(chunk)) return cb(new Error('I hate to be number two!'));
      this.push(chunk.toUpperCase());
      cb();
    }
  )
}

function trimLeading(file, content, cb) {
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

function rename(outfile, outdir, relative) {
  var extlen = path.extname(outfile).length;
  return outfile.slice(0, -extlen) + '.md';
}

function getStdOut (file) { return process.stdout }

if (!module.parent && typeof window === 'undefined') {
  var path = require('path');
  var fixtures = path.join(__dirname, 'test', 'fixtures')
  var root = path.join(fixtures, 'root');
  var outdir = path.join(fixtures, 'out');

  go({ transforms: [ toUpper ], outdir: outdir, rename: rename}, { root: root })
    .on('data', function (data) {
      console.log(data);  
    })
    .on('error', function (err) {
      console.error('error', err); 
    });
}
