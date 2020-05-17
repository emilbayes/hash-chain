const sodium = require('sodium-native')
const assert = require('nanoassert')

const SEEDBYTES = 32
const BYTES = 32

class HashChain {
  constructor (chain, offset = 0) {
    assert(Buffer.isBuffer(chain))
    // assert(offset >= 0)
    this.chain = chain
    this.offset = offset
    this.length = chain.byteLength / BYTES
    assert(offset <= this.length)
  }

  get (offset) {
    const i = this.offset + offset
    assert(i < this.length)
    assert(i >= 0)

    return this._get(i)
  }

  _get (i) {
    return this.chain.subarray(i * BYTES, (i + 1) * BYTES)
  }

  * [Symbol.iterator] () {
    var start = this.offset
    for (var i = start; i < this.length; i++) {
      yield this._get(i)
      this.offset++
    }
  }

  * entries () {
    var start = this.offset
    for (var i = start; i < this.length; i++) {
      yield [i, this._get(i)]
      this.offset++
    }
  }

  anchors (dist) {
    var i = this.length - 1
    var list = []
    while (i > 0) {
      list.unshift(this.get(i))
      i -= dist
    }

    return list
  }

  static generate (seed, n, offset = 0) {
    assert(seed.byteLength === SEEDBYTES)
    assert(n > 1)
    const chain = Buffer.alloc(n * BYTES)

    var end = chain.byteLength
    chain.subarray(end - BYTES, end).set(seed)
    end -= BYTES

    for (var i = end; i >= BYTES; i -= BYTES) {
      sodium.crypto_generichash(chain.subarray(i - BYTES, i), chain.subarray(i, i + BYTES))
    }

    return new this(chain, offset)
  }

  static fromAnchors (anchors, dist, offset) {
    return new HashChainAnchor(anchors, dist, offset)
  }

  static seedgen (buf) {
    if (buf == null) buf = Buffer.alloc(SEEDBYTES)

    sodium.randombytes_buf(buf)

    return buf
  }

  static verify (hash, prev) {
    const scratch = Buffer.alloc(BYTES)
    sodium.crypto_generichash(scratch, prev)
    return sodium.sodium_memcmp(hash, scratch)
  }
}

class HashChainAnchor extends HashChain {
  constructor (anchors, dist, offset = 0) {
    super(Buffer.alloc(0), 0)

    this.offset = offset
    this.length = anchors.length * dist

    this.anchors = anchors
    this.dist = dist

    this.cursor = 1
    this._buf = Buffer.alloc(BYTES * dist)

    this.get(0)
  }

  _get (i) {
    var distOff = this._fill(i)
    i -= distOff
    return this._buf.subarray(i * BYTES, (i + 1) * BYTES)
  }

  _fill (i) {
    var interval = Math.floor(i / (this.dist))
    if (this.cursor === interval) return interval * this.dist

    var end = this._buf.byteLength
    this._buf.subarray(end - BYTES, end).set(this.anchors[interval])
    end -= BYTES

    for (var j = end; j >= BYTES; j -= BYTES) {
      sodium.crypto_generichash(this._buf.subarray(j - BYTES, j), this._buf.subarray(j, j + BYTES))
    }

    this.cursor = interval
    return interval * this.dist
  }
}

HashChain.SEEDBYTES = SEEDBYTES
HashChain.BYTES = BYTES

module.exports = HashChain
