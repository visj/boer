# [695] Getting meta info about how a value matched a schema

**What version of Ajv you are you using?**

5.5.2

**What problem do you want to solve?**

I'm dynamically generating an HTML form. The shape of later parts of the form depends on choices made in earlier fields. For example:

```js
let schema = {
  type: 'object',
  oneOf: [{
    properties: {
      type: { type: 'string', enum: ['type-a', 'type-b'] },
      value: { $ref: '#/definitions/stringList' }
    },
    required: ['type', 'value']
  }, {
    properties: {
      type: { type: 'string', enum: ['type-c'] },
      value: { $ref: '#/definitions/numberList' }
    },
    required: ['type', 'value']
  }],
  // ...
};
```

And say I have this value:

```js
let obj = {
  type: 'type-a',
  value: []
};
```

Ajv is already doing the heavy lifting of matching the value to the schema, but in the end it only gives me a yes/no answer (yes, it matched). But I'd like to know what the schema for `obj.value` is, given that `obj.type === 'type-a'`, so the UI can offer the proper fields, autocomplete options, etc.

**What do you think is the correct solution to problem?**

The correct solution is probably an option or separate method in ajv to generate a mapping from each sub-value in the original value to the sub-schema it matched against. Like:

```js
let map = ajv.match(schema, obj);
assert(map.get(obj.value) === schema.definitions.stringList) // or something
```

I imagine this data is already available to ajv, just not exposed through the API, unless I'm missing something. I guess there may be unforeseen difficulties, but if this functionality is limited to schema-paths containing `oneOf` (as opposed to `anyOf`), it may be quite easy to implement if you already know the ajv source-code.

**Will you be able to implement it?**

I might give it a go at some point if no one else does. Though it's unlikely I could do this well without spending a bunch of time learning the ajv source-code. My hope is that this feature is already available somewhere and I just missed it, or that it is attractive enough and easy enough to implement that someone already familiar with the code will want to tackle it.