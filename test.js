var HashChain = require('.')

const seed = HashChain.seedgen()
const ch = HashChain.generate(seed, 2)

for (const hash of ch) {
  console.log(hash)
}
