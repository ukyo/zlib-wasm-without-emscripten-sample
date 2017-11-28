'use strict';

const Benchmark = require('benchmark');
const util = require('util');
const fs = require('fs');
const path = require('path');
const pako = require('pako');

const zlibSample = require('../src/index.js');
const zlib = require('zlib');

(async () => {
  const myZlib = await zlibSample.initialize();
  const chunkSize = 32 * 1024;
  const level = 6;
  const source = fs.readFileSync(path.join(__dirname, "lorem_1mb.txt"));

  // warmup
  myZlib.deflate(source);
  zlib.deflateRawSync(source, { chunkSize, level });
  pako.deflateRaw(source, { chunkSize, level });

  // run
  await new Promise((resolve) => {
    console.log(`## payload size: ${source.length}`);

    const suite = new Benchmark.Suite();

    suite
      .add('wasm', {
        fn: () => {
          myZlib.deflate(source);
        },
      })
      .add('pako', {
        fn: () => {
          pako.deflateRaw(source, { chunkSize, level });
        },
      })
      .add('native', {
        fn: () => {
          zlib.deflateRawSync(source, { chunkSize, level });
        },
      })
      .on('cycle', (event) => {
        console.log(String(event.target));
      })
      .on('complete', () => {
        console.log('Fastest is ' + suite.filter('fastest').map('name'));
        resolve();
      })
      .run({ async: true });
  });
})();
