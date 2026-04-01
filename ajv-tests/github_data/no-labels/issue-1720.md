# [1720] Possible memory leak in ajv.compile

**What version of Ajv are you using?**

8.1.0, 8.6.2

**Does the issue happen if you use the latest version?**
Yes

**Ajv options object:**

```javascript
{allErrors: true}

```

### Description 
As per the issue reference https://github.com/ajv-validator/ajv/issues/1221, we have to use `ajv.compile` to validate meta schema for a custom keyword, because `ajv.validateSchema` is not performing it. 

While doing so, its observed a possible memory leak in `ajv.compile` method. On frequent calling of `ajv.compile` on the **same schema object** keep increasing the memory usage. Even `ajv.removeSchema` does not clear up the cache. 

### Code
```javascript
const Ajv = require('ajv');

const ajv = new Ajv({allErrors: true});

ajv.addKeyword({
  keyword: "range",
  type: "number",
  compile([min, max], parentSchema) {
    return (data) => data > min && data < max
  },
  errors: false,
  metaSchema: {
    // schema to validate keyword value
    type: "array",
    items: [{type: "number"}, {type: "number"}],
    minItems: 2,
    additionalItems: false,
  },
});

const schema = {
  $id: '/our/schema',
  type: "object",
  properties: {
    foo: {
        type: "number", 
        range: [6, 1] 
    },
    bar: {
        type: "number", 
        range: [1, 5],
    }
  },
  required: ["foo"],
  additionalProperties: false
}

const run = () => {
    try {
       ajv.compile(schema)
    } catch (error) {
       console.error("Ajv schema is invalid", error)
    } finally {
        ajv.removeSchema(schema.$id)
    }
    
    ajv.validate(schema, { foo: 7, bar: 2 })
    ajv.validate(schema, { foo: 1, bar: 4 })
    console.log(Math.ceil(process.memoryUsage().heapUsed / 1024) + "KB")
}

for(let i=0; i < 10; i++) {
  run();
}

```

Its observe that memory usage is increased linearly, tested it for longer time and it end up filling GBs of memory. 

### Possible causes  
1. It seesm `ajv.compile` is not recognizing the **same schema** object
2. And `ajv.removeSchema` is not clearing up the cache properly


A working example of the code can be tested here. 

https://runkit.com/nazarhussain/60fad50131574c001bf0d784
