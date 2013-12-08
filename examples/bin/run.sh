#!/usr/bin/env sh

node ../../bin/mutiny.js  -t ./local-transform/toUpper.js -t trim-leading -o ../../test/fixtures/mutinied  ../../test/fixtures/root/
