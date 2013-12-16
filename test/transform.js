'use strict';
/*jshint asi: true */

var test = require('tap').test
var path = require('path');
var through = require('through2');
var mutiny = require('../')

var adapt = require('./util/adapt-entries')
  , relative = require('./util/relative')
  , fail = require('./util/fail')
  , accOut = require('./util/acc-out')

function toUpper(file) {
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
  // definitely handling it here, so why does it go undhandled ???
  // see test at bottom
  .on('error', function (err) {
    console.error('E', err);  
  });
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

var fixtures = path.join(__dirname, '..', 'test', 'fixtures');
var root = path.join(fixtures, 'root');
var out = path.join(fixtures, 'out');

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

function getStdOut () { return process.stdout }

test('\nrunning upperCase transform', function (t) {
  var progress = []
    , data = {}

  mutiny({ getOutStream: accOut.bind(null, data), outdir: out, transform: toUpper }, { root: root })
    .on('error', fail.bind(t))
    .on('data', [].push.bind(progress))
    .on('end', function () {

      t.deepEqual(
          adapt(progress)
        , [ { file: '/fixtures/root/index.html',
              outfile: '/fixtures/out/index.html' },
            { file: '/fixtures/root/sub1/one.html',
              outfile: '/fixtures/out/sub1/one.html' },
            { file: '/fixtures/root/sub2/two.html',
              outfile: '/fixtures/out/sub2/two.html' } ]
        , 'reports progress for all files'
      )

      t.deepEqual(
          data
        , { '/fixtures/out/index.html': [ '<HTML>\n  <BODY>\n    <H1>INDEX</H1>  \n  </BODY>\n</HTML>\n' ],
            '/fixtures/out/sub1/one.html': [ '<HTML>\n  <BODY>\n    <H1>ONE</H1>  \n  </BODY>\n</HTML>\n' ],
            '/fixtures/out/sub2/two.html': [ '<HTML>\n  <BODY>\n    <H1>TWO</H1>  \n  </BODY>\n</HTML>\n' ] }
        , 'applies transform and streams into out stream supplying correct file path'
      )

      t.end()
    });
})

test('\nrunning toUpper and then trimLeading transforms', function (t) {
  var progress = []
    , data = {}

  mutiny({ getOutStream: accOut.bind(null, data), outdir: out, transform: [ toUpper, trimLeading ] }, { root: root })
    .on('error', fail.bind(t))
    .on('data', [].push.bind(progress))
    .on('end', function () {
      t.deepEqual(
          adapt(progress)
        , [ { file: '/fixtures/root/index.html',
              outfile: '/fixtures/out/index.html' },
            { file: '/fixtures/root/sub1/one.html',
              outfile: '/fixtures/out/sub1/one.html' },
            { file: '/fixtures/root/sub2/two.html',
              outfile: '/fixtures/out/sub2/two.html' } ]
        , 'reports progress for all files'
      )

      t.deepEqual(
          data
        , { '/fixtures/out/index.html': [ '<HTML>\n<BODY>\n<H1>INDEX</H1>  \n</BODY>\n</HTML>\n' ],
            '/fixtures/out/sub1/one.html': [ '<HTML>\n<BODY>\n<H1>ONE</H1>  \n</BODY>\n</HTML>\n' ],
            '/fixtures/out/sub2/two.html': [ '<HTML>\n<BODY>\n<H1>TWO</H1>  \n</BODY>\n</HTML>\n' ] }
        , 'applies transform and streams into out stream supplying correct file path'
      )

      t.end()
    });
})


test('\nrunning trimLeading and then toUpper transforms', function (t) {
  var progress = []
    , data = {}

  mutiny({ getOutStream: accOut.bind(null, data), outdir: out, transform: [ trimLeading, toUpper ] }, { root: root })
    .on('error', fail.bind(t))
    .on('data', [].push.bind(progress))
    .on('end', function () {
      t.deepEqual(
          adapt(progress)
        , [ { file: '/fixtures/root/index.html',
              outfile: '/fixtures/out/index.html' },
            { file: '/fixtures/root/sub1/one.html',
              outfile: '/fixtures/out/sub1/one.html' },
            { file: '/fixtures/root/sub2/two.html',
              outfile: '/fixtures/out/sub2/two.html' } ]
        , 'reports progress for all files'
      )

      t.deepEqual(
          data
        , { '/fixtures/out/index.html': [ '<HTML>\n<BODY>\n<H1>INDEX</H1>  \n</BODY>\n</HTML>\n' ],
            '/fixtures/out/sub1/one.html': [ '<HTML>\n<BODY>\n<H1>ONE</H1>  \n</BODY>\n</HTML>\n' ],
            '/fixtures/out/sub2/two.html': [ '<HTML>\n<BODY>\n<H1>TWO</H1>  \n</BODY>\n</HTML>\n' ] }
        , 'applies transform and streams into out stream supplying correct file path'
      )

      t.end()
    });
})

test('\nrunning upperCase transform that was indicated via full string path', function (t) {
  var progress = []
    , data = {}

  mutiny(
      { getOutStream: accOut.bind(null, data), outdir: out, transform: __dirname + '/fixtures/to-upper.js' }
    , { root: root })
    .on('error', fail.bind(t))
    .on('data', [].push.bind(progress))
    .on('end', function () {

      t.deepEqual(
          adapt(progress)
        , [ { file: '/fixtures/root/index.html',
              outfile: '/fixtures/out/index.html' },
            { file: '/fixtures/root/sub1/one.html',
              outfile: '/fixtures/out/sub1/one.html' },
            { file: '/fixtures/root/sub2/two.html',
              outfile: '/fixtures/out/sub2/two.html' } ]
        , 'reports progress for all files'
      )

      t.deepEqual(
          data
        , { '/fixtures/out/index.html': [ '<HTML>\n  <BODY>\n    <H1>INDEX</H1>  \n  </BODY>\n</HTML>\n' ],
            '/fixtures/out/sub1/one.html': [ '<HTML>\n  <BODY>\n    <H1>ONE</H1>  \n  </BODY>\n</HTML>\n' ],
            '/fixtures/out/sub2/two.html': [ '<HTML>\n  <BODY>\n    <H1>TWO</H1>  \n  </BODY>\n</HTML>\n' ] }
        , 'applies transform and streams into out stream supplying correct file path'
      )

      t.end()
    });
})

// TODO:  Not sure why these errors go unhandled even though now I'm actually handling it right when creating the transform
/*test('\nrunning error prone upperCase and trimLeading transforms', function (t) {
  var progress = []

  mutiny({ getOutStream: getStdOut, transform: toUpperError }, { root: root })
    .on('error', function (err) {
      t.similar(err, /I hate to be number two/, 'propagates error');
      t.end()
    })
    .on('data', [].push.bind(progress))
    .on('end', fail.bind(null, t));
})*/
