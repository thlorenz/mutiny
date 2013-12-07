#!/usr/bin/env node
'use strict';

// OK, I admit it, lots of this code came from: https://github.com/substack/catw/blob/master/bin/cmd.js
// Thanks @substack :)

var resolve =  require('resolve');
var path    =  require('path');
var fs      =  require('fs');
var through =  require('through2');
var mkdirp  =  require('mkdirp');
var mutiny  =  require('../');
var argv    =  require('minimist')(process.argv.slice(2));

function requireFile(file) {
  return (/^[.\/]/).test(file)
    ? require(path.resolve(file))
    : require(resolve.sync(file, { basedir: process.cwd() }));
}


var filter = argv.f;
var root = argv._[0] && path.resolve(argv._[0]);
var outdir = argv.o && path.resolve(argv.o);
var rename = argv.r && requireFile(argv.r);

if (!outdir)  throw new Error('Need to specify output dir via -o');
if (!root)    throw new Error('Need to specify root dir i.e. ./root');

var transforms = [].concat(argv.t).filter(Boolean).map(requireFile);

function inspect(obj, depth) {
  console.error(require('util').inspect(obj, false, depth || 5, true));
}

// Example:
// from examples/bin
// mutiny  -t ./local-transform/toUpper.js -t trim-leading -o ../../test/fixtures/mutinied  ../../test/fixtures/root/

inspect({ transforms: transforms, rename: rename, root: root, outdir: outdir })

mkdirp(outdir, function (err) {
  if (err) process.exit(err);
  mutiny({ root: root, fileFilter: filter }, transforms, rename)
    .on('error', console.error)
    .pipe(through({ objectMode: true }, function (entry, enc, cb) {
      var p = path.join(outdir, entry.relative)
        , dir = path.dirname(p);

      mkdirp(dir, function (err) {
        if (err) return cb(err);
        fs.writeFile(p, entry.content, 'utf8', cb);
      });

    }))
    .on('error', console.error)
    .on('end', function () { console.log('Done') })
});
