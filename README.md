# zlib-wasm-without-emsripten-sample

A zlib WebAssembly binary build sample with [dcodeIO/webassembly](https://github.com/dcodeIO/webassembly).

## Initialize and Build code

```
$ git clone https://github.com/ukyo/zlib-wasm-without-emsripten-sample.git
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
$ npm run bench:deflate
## payload size: 1000205
wasm x 10.30 ops/sec ±2.05% (30 runs sampled)
pako x 8.46 ops/sec ±5.26% (25 runs sampled)
native x 15.25 ops/sec ±2.49% (41 runs sampled)
Fastest is native

$ npm run bench:inflate
## payload size: 1000205
wasm x 151 ops/sec ±2.70% (69 runs sampled)
pako x 105 ops/sec ±3.66% (66 runs sampled)
native x 199 ops/sec ±3.88% (66 runs sampled)
Fastest is native
```