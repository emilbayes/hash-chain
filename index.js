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

    return this.chain.subarray(i * BYTES, (i + 1) * BYTES)
  }

  * [Symbol.iterator] () {
    var start = this.offset * BYTES
    for (var i = start; i < this.chain.byteLength; i += BYTES) {
      yield this.chain.subarray(i, i + BYTES)
      this.offset++
    }
  }

  static generate (seed, n) {
    assert(seed.byteLength === SEEDBYTES)
    assert(n > 1)
    const chain = Buffer.alloc(n * BYTES)

    var end = chain.byteLength
    chain.subarray(end - BYTES, end).set(seed)
    end -= BYTES

    for (var i = end; i >= BYTES; i -= BYTES) {
      sodium.crypto_generichash(chain.subarray(i - BYTES, i), chain.subarray(i, i + BYTES))
    }

    return new this(chain, 0)
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

HashChain.SEEDBYTES = SEEDBYTES
HashChain.BYTES = BYTES

module.exports = HashChain
