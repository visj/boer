# [537] Is there a built-in api to convert the schema with $data reference

like:

```js
const schema = {
  type: 'object',
  properties: {
    test: {
      type: 'number'
    },
    target: {
      type: 'number'
      minimum: { $data: '/test' }
    }
  }
};

const data = {  test: 5 };

func(schema, data);
// output:

{
  type: 'object',
  properties: {
    test: {
      type: 'number'
    },
    target: {
      type: 'number'
      minimum: 5
    }
  }
}

```

Thanks