var assert = require('assert')
var HashChain = require('.')

const seed = Buffer.from('4e244c9e146969b785de7270ef72bba96955aaa36f5c6160d6514d1ee8ae3212', 'hex') // HashChain.seedgen()
console.log(seed.toString('hex'))
console.time('hash')
const ch = HashChain.generate(seed, 6e6)
console.timeEnd('hash')

console.time('hash')
const ch2 = HashChain.generate(seed, 6e6 - 218, -218)
console.timeEnd('hash')

console.log(ch.length)
console.log(ch2.length)

console.log(ch.get(218).toString('hex'))

console.log(ch2.get(218).toString('hex'))

const ch3 = HashChain.fromAnchors(ch.anchors(5e4), 5e4)

console.log(ch.anchors(5e4).length * 32)

console.log(ch3.get(218).toString('hex'))
var d = Date.now()
for (var h of ch3) {
  var s = Date.now() - d
  h.toString('hex')
  if (s > 10) console.log('pause', s)

  d = Date.now()
}

assert.deepStrictEqual(Array.from(ch3, b => b.toString('hex')), Array.from(ch, b => b.toString('hex')))
//  4829.194ms
