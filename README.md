# mutiny [![build status](https://secure.travis-ci.org/thlorenz/mutiny.png)](http://travis-ci.org/thlorenz/mutiny)

Recursively mutates files in a given directory.

```js
var through = require('through2');
var mutiny = require('mutiny');

function toUpper(file, content) {
  return through(
    function (chunk, enc, cb) {
      this.push(chunk.toUpperCase());
      cb();
    }
  )
}

var readdirpOpts = { root: __dirname + '/root' };
mutiny({ outdir: __dirname + '/out', transforms: [ toUpper ]}, readdirpOpts)
  .on('error', console.error)
  .on('data', function (d) { console.log('\nProcessed:\n', d); })
```
[transforms example](https://github.com/thlorenz/mutiny/tree/master/examples/transform-only.js)

```sh
# assuming trim-leading is a transform installed as a node_module
mutiny ./root -t ./local-transform/toUpper.js -t trim-leading -o ./out 
```
[bin example](https://github.com/thlorenz/mutiny/tree/master/examples/bin)

## Installation

    npm install mutiny

## API

### mutiny(mutinyopts, readopts)

Mutates the files of a directory recursively applying specified @see transforms and/or a @see rename function.
The transformed files are saved into the @see outdir and directory structure is maintained.

**params:**

- mutinyopts *Object* with the following properties
  - {String} outdir: the root of the directory to which to write the transformed/renamed files
  - {Array[fn:TransformStream]}  transforms: that transform each file's content
      signature: function({String} file) : {TransformStream}
  - {Function} rename: that rename each file
      signature: function ({String} outfile, {String} outdir, {String} relativeOutfile) : {String} outfile
- readopts *Object* options passed through to [readdirp](https://github.com/thlorenz/readdirp)
  - be sure to specify the `root` of the source directory here

**returns:**

*ReadStream* which emits 'error' and/or 'data' to update mutiny's progress

## More Examples

Please find more examples in the [examples directory](https://github.com/thlorenz/mutiny/tree/master/examples) and consult the [tests](https://github.com/thlorenz/mutiny/tree/master/tests)

## License

MIT
