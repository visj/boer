# [1158] Merge defaults from parent

How can I merge the defaults from the first parent object instead of having to repeat them each time going down the tree?

```js
const validate = ajv.compile({
  "type": "object",
  "default": {
    "url": "abc",
    "decimal": 5,
    "values": {
      "test1": {
        "a": 8,
        "b": 6
      },
      "test2": {
        "c": 3,
        "d": 4
      }
    }
  },
  "properties": {
    "url": { "type": "string" , "default":  "abc"  },
    "decimals": { "type": "number", "default": 5 }
  },
  "values": {
    "type": "object",
    "properties": {
      "test1": {
        "type": "object",
        "default": { "a": 8, "b": 6 },
        "properties": {
          "a": { "type": "number", "default": 8 },
          "b": { "type": "number", "default": 6 }
        }
      },
      "test2": {
        "type": "object",
        "default": { "c": 3, "d": 4 },
        "properties": {
          "c": { "type": "number", "default": 3 },
          "d": { "type": "number", "default": 4 }
        }
      }
    }
  }
});
```
So that it simplifies to this:

```js
const validate = ajv.compile({
  "type": "object",
  "default": {
    "url": "abc",
    "decimal": 5,
    "values": {
      "test1": {
        "a": 8,
        "b": 6
      },
      "test2": {
        "c": 3,
        "d": 4
      }
    }
  },
  "properties": {
    "url": { "type": "string"  },
    "decimals": { "type": "number" }
  },
  "values": {
    "type": "object",
    "properties": {
      "test1": {
        "type": "object",
        "properties": {
          "a": { "type": "number" },
          "b": { "type": "number" }
        }
      },
      "test2": {
        "type": "object",
        "properties": {
          "c": { "type": "number" },
          "d": { "type": "number" }
        }
      }
    }
  }
});
```