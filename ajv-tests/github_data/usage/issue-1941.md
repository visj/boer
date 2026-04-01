# [1941] AJV is reporting the missing of required properties incorrectly (only on the "top" level of JSON Schema)

**Ajv version: 8.11.0**

```javascript
import Ajv from 'ajv';
const ajv = new Ajv();

// example from https://json-schema.org/learn/getting-started-step-by-step.html#intro
const schema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Product',
  description: "A product from Acme's catalog",
  type: 'object',
  properties: {
    productId: {
      description: 'The unique identifier for a product',
      type: 'integer',
    },
    productName: {
      description: 'Name of the product',
      type: 'string',
    },
    price: {
      description: 'The price of the product',
      type: 'number',
      exclusiveMinimum: 0,
    },
    dimensions: {
      type: 'object',
      properties: {
        length: {
          type: 'number',
        },
        width: {
          type: 'number',
        },
        height: {
          type: 'number',
        },
      },
      required: ['length', 'width', 'height'],
    },
  },
  // Error: schema is invalid: data must have required property 'productId'
  "required": [ "productId", "productName", "price" ]
};

const validate = ajv.compile(schema);

const data = {
  productId: 1,
  productName: 'abc',
  dimensions: {
    length: 10,
    width: 10,
    height: 10,
  },
};

if (validate(data)) {
  console.log('valid');
} else {
  console.log(validate.errors);
}


```

https://runkit.com/creativedeveloper/624427a130bc2b0008b583ae
https://stackblitz.com/edit/typescript-bmpdty?file=index.ts

**Error message**

```
Error: schema is invalid: data must have required property 'productId'
```

**What results did you expect?**
Ajv shouldn't throw an error when there is a `required` field on the "top" level of JSON Schema and that required properties are included in the schema.
