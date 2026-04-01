# [1414] Reference resolution issue in v7

I'm using version **7.0.3**.  

Consider the following piece of code:

```javascript
const Ajv = require("ajv").default;

const instance = new Ajv({
  loadSchema: uri => {
    return Promise.resolve({
      $id: "http://two/",
      type: "object",
      properties: {
        bar: {
          $ref: "#/definitions/bar",
        },
      },
      definitions: {
        bar: {
          type: "string",
        },
      },
    });
  },
});

instance.compileAsync(
  {
    $id: "http://one/",
    type: "object",
    properties: {
      foo: {
        $ref: "#/definitions/foo",
      },
    },
    definitions: {
      foo: {
        $ref: "http://two/",
      },
    },
  },
  false
);
```

For whatever reason when processing the lazy loaded schema `http://two/` Ajv thinks that the base URL is still `http://one/` and tries to resolve the `bar` property reference accordingly, resulting in this error:

```
Error: AnySchema http://one/ is loaded but http://one/#/definitions/bar cannot be resolved
    at Ajv.checkLoaded (D:\dev\cis-dm-core\node_modules\ajv\lib\core.ts:377:15)
    at Ajv._compileAsync (D:\dev\cis-dm-core\node_modules\ajv\lib\core.ts:369:21)
    at Ajv._compileAsync (D:\dev\cis-dm-core\node_modules\ajv\lib\core.ts:371:30)
```

This problem is new in version 7, it first popped up after upgrading from version 6.

I've spent several hours debugging this issue and it seems like that changing this line:  
https://github.com/ajv-validator/ajv/blob/v7.0.3/lib/compile/index.ts#L265

```javascript
if (id === normalizeId(ref)) return new SchemaEnv({schema: schOrRef.schema, root, baseId})
```
to
```javascript
if (id === normalizeId(ref)) return new SchemaEnv({schema: schOrRef.schema, root, schOrRef.baseId})
```
solves the issue in this particular case. I don't have enough knowledge of the codebase to be able to tell if this is the _proper_ fix though, i.e. whether it could break something else.

If `#/definitions/foo` is inlined:

```javascript
instance.compileAsync(
  {
    $id: "http://one/",
    type: "object",
    properties: {
      foo: {
        $ref: "http://two/",
      },
    },
  },
  false
);
```
then everything works as expected.