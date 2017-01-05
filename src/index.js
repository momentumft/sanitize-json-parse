const traverse = require("traverse")

let map

const patch = () => {
  const old = JSON.parse.bind(JSON)
  JSON.parse = function() {
    const result = old.apply(null, arguments)
    traverse(result).forEach((node) => {
      if (node && typeof node === "object") {
        map.set(node, 1)
      }
    })
    return result
  }
}

const patchFn = (fn, context) => {
  return function(...args) {
    traverse(args).forEach((node) => {
      if (node && typeof node === "object" && map.get(node)) {
        throw new Error("Unsanitized user input passed to sanitized function")
      }
    })
    return fn.apply(context, arguments)
  }
}

const patchObj = (obj) => {
  return traverse(obj).map(function(node) {
    if (node && typeof node === "function") {
      this.update(patchFn(node, this.parent.node))
    }
  })
}

module.exports = (thing) => {
  if (!map) {
    map = new WeakMap()
    patch()
  }
  if (typeof thing === "function") {
    return patchFn(thing)
  }
  return patchObj(thing)
}
