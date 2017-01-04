const traverse = require("traverse")

let map

const patch = () => {
  const old = JSON.parse.bind(JSON)
  JSON.parse = function() {
    const result = old.apply(null, arguments)
    return traverse(result).forEach((node) => {
      if(node && typeof node === "object") {
        map.set(node, 1)
      }
    })
  }
}

patch()


const patchConsumer = (fn) => {
  return function(...args) {
    traverse(args).forEach((node) => {
      if(node && typeof node === "object" && map.get(node)){
        throw new Error("Unsanitized user input passed to sanitized function")
      }
    })
    return fn.apply(null, arguments)
  }
}

module.exports = (fn) => {
  if(!map) {
    map = new WeakMap
    patch()
  }
  return patchConsumer(fn)
}
