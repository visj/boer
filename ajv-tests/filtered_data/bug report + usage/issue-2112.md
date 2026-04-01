# [2112] dependentSchemas unknown keyword

I am getting error when switching from `dependencies` to `dependentSchemas`:

```ts
import Ajv from 'ajv';

const ajv = new Ajv();

export const schema = {
    type: 'object',
    properties: {
        foo: { type: 'string' },
        bar: { type: 'string' },
    },
    dependentSchemas: { // <- dependencies works
        foo: { required: ['bar'] }
    }
}

const validate = ajv.compile(schema);
```

```
Error: strict mode: unknown keyword: "dependentSchemas"
```

Reference: [https://ajv.js.org/json-schema.html#dependentschemas](https://ajv.js.org/json-schema.html#dependentschemas)

`node`: `v16.17.0`
`ajv`: `8.11.0`