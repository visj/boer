# [1632] how do `items` and `additionalItems` interact in strict mode?

Maybe this is just a question: for schema type 'array' how are 'items' and 'additionalItems' expected to work together? I have yet to hit on a valid combination in strict mode. 

ajv@8.5.0 (latest)

**options**
```js
const options = {strict: true};
```

**JSON Schema**
```js
const schema = {
  $id: 'x',
  type: 'array',
  items: [{ type: 'string' }, { type: 'string' }],
  additionalItems: { type: 'string', maxLength: 4 },
  minItems: 2,
  maxItems: 10
};

```

**Sample data**
```json
data = ['a', 'b', 'c', 'd'];
```

**Your code**
```javascript
const ajv = new Ajv(options);
ajv.addSchema(schema);
// throws on next line
const validator = ajv.getSchema('x');

// message: strict mode: "items" is 2-tuple, but minItems or maxItems/additionalItems are not specified or different at path "#"

```

**Validation result, data AFTER validation, error messages**

N/A


**What results did you expect?**

I expected it to succeed. `items` validations are ok, `minItems` passes, `maxItems` passes. and `additionalItems` seems like it should pass - the additional items are strings less than the length limit.

I understand that I can add the `strictTuples: false` option, but am wondering if there is *any* valid combination of `items` and `additionalItems` with option `strict: true`.