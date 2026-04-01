# [2517] ability to generate standalone code from the callback specified in the validate property

If a callback function inputted to the `validate` property is self contained, then it could be used to generate the standalone code.

Why not allow the client to specify a flag that would use the validate callback to generate standalone code?

```
ajv.addKeyword({
  keyword: "even",
  type: "number",
  schemaType: "boolean",
  // $data: true // to support [$data reference](./guide/combining-schemas.md#data-reference), ...
  validate: (schema, data) => {
    return true;
  },
  code(cxt) {
    const { data, schema } = cxt;
    const op = schema ? Ajv._`!==` : Ajv._`===`;
    cxt.fail(Ajv._`${data} %2 ${op} 0`); // ... the only code change needed is to use `cxt.fail$data` here
  },
});
```