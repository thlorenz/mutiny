'use strict';

var readdirp =  require('readdirp')
  , through  =  require('through2')

var defaultGetOutStream = require('./lib/default-getOutStream')
  , transformContent = require('./lib/transform-content')
  , filterDirsAndResolveOutStream = require('./lib/filter-dirs-and-source-out-stream')

function keepName(outfile, outdir, relative) { return outfile }

/**
 * Mutates the files of a directory recursively applying specified @see transforms and/or a @see rename function.
 * The transformed files are saved into the @see outdir and directory structure is maintained.
 * 
 * @name mutiny 
 * @function
 * @param {Object} mutinyopts with the following properties
 *  - {String} outdir: the root of the directory to which to write the transformed/renamed files
 *  - {Array[fn:TransformStream]}  transforms: that transform each file's content
 *      signature: function({String} file) : {TransformStream}
 *  - {Function} rename: that rename each file
 *      signature: function ({String} outfile, {String} outdir, {String} relativeOutfile) : {String} outfile
 *  - {Function} getOutStream: allows overriding the defaultOutStream in case @see rename is not sufficient
 *      signature: function ({String} outfile, {String} outdir, {String} relativeOutfile) : {WriteStream}
 * @param {Object} readopts options passed through to [readdirp]{@link https://github.com/thlorenz/readdirp}
 *  - be sure to specify the `root` of the source directory here
 * @return {ReadStream} which emits 'error' and or 'data' to update mutiny's progress
 */
var go = module.exports = function mutiny(mutinyopts, readopts) {
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
    .pipe(through({ objectMode: true }, filterDirsAndResolveOutStream(getOutStream, rename, outdir)))
    .on('error', progress.emit.bind(progress, 'error'))
    .pipe(through({ objectMode: true }, transformContent(progress, transforms)))
    .on('error', progress.emit.bind(progress, 'error'))
    .pipe(progress);

  return progress;
};
