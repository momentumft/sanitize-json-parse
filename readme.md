# Sanitize JSON Parse

Simple module to aid debugging whether unsanitized `JSON.parse` output is
used directly in database queries (or any sensitive method)

WARNING: DO NOT USE IN PRODUCTION - USE FOR DEBUGGING ONLY

### Methodology

This module monkey-patches `JSON.parse` and traverses the output of the call.
Any Objects or Arrays are set to a global `WeakMap`.

Any functions that are patched by the module will traverse the arguments to
check whether the raw arrays or objects produced by `JSON.parse` are used in
the patched function.

### Usage

The module exposes a single method - which can be called repeatedly to wrap
any functions that you want to santize:

```javascript
const sanitize = require("sanitize-json-parse")

const dbInstance = createDbInstance()
dbInstance.find = sanitize(dbInstance.find.bind(dbInstance))
```

In the above example `dbInstance.find` will check whether any of the arguments
passed to it were created directly by JSON.parse. If a match is found the
function will throw an error.
