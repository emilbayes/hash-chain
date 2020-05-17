# `hash-chain`

> Hash Chain implementation using Blake2b

## Usage

```js
var HashChain = require('hash-chain')

```

Persistence:

```js
var chain = // ...
const fs = require('fs')
const fd = fs.open('filename')
fs.write(fd, chain.offset, 0, 4)
fs.write(fd, chain.chain)
fs.close(fd)
```

```js
const fs = require('fs')
const data = fs.readFile('filename')

var chain = new HashChain(data.subarray(4), data.readUInt32LE(0))
```

## API

### `const seed = HashChain.seedgen([buf])`

Generate a new `seed`, optionally into an existing `Buffer` `buf`.

### `const ch = HashChain.generate(seed, n, [offset = 0])`

Generate and instantiate a new `HashChain` from `seed` `Buffer` with `n`
elements.`seed` must be `HashChain.SEEDBYTES` long. Optionally offset the
chain.

### `const ch = HashChain.fromAnchors(anchors, dist, [offset = 0])`

Generate and instantiate a new lazy `HashChain` a list of anchor points,
with `dist` elements between each anchor. Optionally offset the
chain. This will only keep a buffer of `dist` points in memory, lazily
generating missing points as they're accessed.

### `const ch = new HashChain(chainBuf, baseOffset = 0)`

Instantiate a new `HashChain` from an existing `chainBuf` at `offset`.

### `const chainBuf = ch.chain`

Read the `Buffer` used in the chain `ch`

### `const offset = ch.offset`

Read the current integer offset

### `const len = ch.length`

Total number of elements in the chain

### `const elm = ch.get(offset)`

Get the element as a `Buffer` at `offset` from the `offset` given in
the constructor. Normally HashChains only move forward, but giving a negative
integer allows you to go back. This does not increment the internal counter.

### `for (const elm of ch)` (`Symbol.iterator`)

Iterate over the elements in the chain using an `Iterator`

### `const anchors = ch.anchors(dist)`

Generate anchor points with `dist` elements between each anchor. This can be
used to optimise initialisation of an existing chain at the expense of more
disk space.

## Install

```sh
npm install hash-chain
```

## License

[ISC](LICENSE)
