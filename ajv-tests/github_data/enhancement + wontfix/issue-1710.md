# [1710] useDefaults requires explicit empty object for intermediate object entries to work for nested properties 

**What version of Ajv you are you using?**
6.12.5 but also tried with 8.6.2

**What problem do you want to solve?**
Assume we have definition with nested objects:

```
const schema = {
  type: "object",
  properties: {
    a: {
      type: "object",
      properties: {
        b: {
          type: "string",
          default: "123"
        }
      }
    },
    c: {
      type: "string",
      default: "456"
    }
  }
};
```

Then we want to init data with default values:

```
const data = {};
const ajv = new Ajv({ useDefaults: true });
ajv.compile(schema)(data);
``` 

This processes only first-level properties and gives `{"c":"456"}`.  To get `{"a":{"b":"123"},"c":"456"}` it's required to add explicit `default: {}` to every entry with type of "object" like

```
const schema = {
  type: "object",
  properties: {
    a: {
      type: "object",
      default: {},
      properties: {
        b: {
          type: "string",
          default: "123"
        }
      }
    },
    c: {
      type: "string",
      default: "456"
    }
  }
};
```

But with this approach, if we try to inject `default: {}` in every object just in sake of nested properties, we might end with empty objects in our data:

```
const schema = {
  type: "object",
  properties: {
    a: {
      type: "object",
      default: {},
      properties: {
        b: {
          type: "string", // no "default:"!
        },
      },
    },
  }
};
```

will give us `{ a: {} }` while I expect to get `{}`.

**What do you think is the correct solution to problem?**
I think that ability to init defaults in deep without need to explicitly declare `default: {}` on every object would add flexibility.  Checked [JSON schema 7.0 docs](https://json-schema.org/understanding-json-schema/reference/generic.html) and don't see any way approach contradicts how "default" is worked(well, docs are actually about validation instead of generating data but still).

**Will you be able to implement it?**
If everything above makes sense, I'm ready.