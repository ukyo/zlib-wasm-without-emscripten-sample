# zlib-wasm-without-emscripten-sample

A zlib WebAssembly binary build sample with [dcodeIO/webassembly](https://github.com/dcodeIO/webassembly).

## Initialize and Build code

```
$ git clone https://github.com/ukyo/zlib-wasm-without-emscripten-sample.git
$ cd zlib-wasm-without-emsripten-sample
$ npm install
$ npm run build
``` 

## Example

```js
const myZlib = await require("./src/index").initialize();
const deflated = myZlib.deflate(buffer);
console.log(myZlib.inflate(deflated).equals(buffer));
```

## Benchmark

* NodeJS: v8.9.1
* OS: MacBook Pro
* CPU: Intel Core i5 2.4GHz 
* Memory: 16GB

```
$ npm run bench

## lorem_1mb.txt size: 1000205
wasm x 9.61 ops/sec ±4.48% (27 runs sampled)
pako x 8.70 ops/sec ±2.26% (25 runs sampled)
native x 15.21 ops/sec ±3.15% (41 runs sampled)
Deflate: Fastest is native
## deflated lorem_1mb.txt size: 257012
wasm x 120 ops/sec ±10.26% (60 runs sampled)
pako x 106 ops/sec ±8.56% (67 runs sampled)
native x 211 ops/sec ±2.68% (74 runs sampled)
Inflate: Fastest is native
```
