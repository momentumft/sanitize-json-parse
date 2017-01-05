const {ok, equal, deepEqual, throws, doesNotThrow} = require("assert")
const {reject, is} = require("ramda")
const removeFunctions = reject(is(Function))
const sanitize = require("../src")

const result = Math.random()
const fn = (arg) => [result, arg]
const fn2 = sanitize(fn)

const obj = {
  fn1(arg) {
    return [result, arg]
  },
  fn2(arg) {
    return [arg, this.b]
  },
  a: 1,
  b: Math.random(),
  c: [],
  d: {},
}

const obj2 = sanitize(obj)

describe("sanitize-json-parse", () => {
  describe("function patching", () => {
    it("returns a new function", () => {
      ok(fn !== fn2)
    })

    it("doesn't affect the returned result", () => {
      deepEqual(fn(), fn2())
    })

    it("doesn't modify the arguments", () => {
      const thing = {}
      equal(fn(thing)[1], fn2(thing)[1])
    })

    it("throws when object created by JSON.parse is an argument", () => {
      const arg = JSON.parse("{}")
      throws(() => {
        fn2(arg)
      })
    })

    it("throws when array created by JSON.parse is an argument", () => {
      const arg = JSON.parse("[]")
      throws(() => {
        fn2(arg)
      })
    })

    it("throws when deep object created by JSON.parse is an argument", () => {
      const arg = JSON.parse("{\"a\":[]}")
      throws(() => {
        fn2(arg.a)
      })
    })

    it("doesn't throw when cloned object is an argument", () => {
      const arg = JSON.parse("{\"a\":1}")
      const arg2 = Object.assign({}, arg)
      deepEqual(arg, arg2)
      doesNotThrow(() => {
        fn2(arg2)
      })
    })

    it("throws when shallow cloned object is an argument", () => {
      const arg = JSON.parse("{\"a\":[]}")
      const arg2 = Object.assign({}, arg)
      deepEqual(arg, arg2)
      throws(() => {
        fn2(arg2)
      })
    })

  })

  describe("object/class patching", () => {
    it("doesn't affect non function properties", () => {
      deepEqual(removeFunctions(obj), removeFunctions(obj2))
    })

    it("returns a new function", () => {
      ok(obj.fn1 !== obj2.fn1)
    })

    it("doesn't affect the returned result", () => {
      deepEqual(obj.fn1(), obj2.fn1())
    })

    it("doesn't modify the arguments", () => {
      const thing = {}
      equal(obj.fn1(thing)[1], obj2.fn1(thing)[1])
    })

    it("preserves context", () => {
      const thing = {}
      equal(obj.fn2(thing)[1], obj2.fn2(thing)[1])
    })

    it("throws when object created by JSON.parse is an argument", () => {
      const arg = JSON.parse("{}")
      throws(() => {
        obj2.fn1(arg)
      })
    })

    it("throws on another function when object created by JSON.parse is an argument", () => {
      const arg = JSON.parse("{}")
      throws(() => {
        obj2.fn2(arg)
      })
    })
  })

})
