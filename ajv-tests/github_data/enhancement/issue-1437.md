# [1437] Disable coercion enterily or selectively at global and local levels


**What version of Ajv you are you using?**

7.0.3

**What problem do you want to solve?**

In some circumstances, I wish to disable the coercion of a property. Take for example a timestamp defined as a `number`. If the user provides a boolean value, I expect a validation error to be thrown and not the value `true` to be converted to `1` which is a valid but incorrect timestamp:

```
const assert = require('assert')
const Ajv = require("ajv").default;

const data = {
  timestamp: true
};

const ajv = new Ajv({
  coerceTypes: true
})
validate = ajv.compile({
  "type": "object",
  "properties": {
    "timestamp": {
      "type": "integer"
    }
  }
})
error = validate(data)
// Expect an error instead of `1`
assert.equal(data.timestamp, 1)
```

**What do you think is the correct solution to problem?**

My expectation is the ability to entirely or selectively disable some coercion rules, either at a global level when AJV is instantiated or at a local level when the property is defined.

At a global level:

```js
const ajv = new Ajv({
  coerceTypes: {
    // all coercion rules are enabled by default beside the ones declared:
    boolean_to_integer: false
  }
})
```

At a local level:

```js
ajv.compile({
  "type": "object",
  "properties": {
    "timestamp": {
      "coercion": false
      "type": "integer"
    }
  }
})
```

**Will you be able to implement it?**

Maybe with some guidelines