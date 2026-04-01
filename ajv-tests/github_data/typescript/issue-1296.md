# [1296] SchemaValidateFunction requires certain types of ErrorObjects that we don't want to specify.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**


**Your typescript code**
v6.12.5

```typescript
import Ajv from "ajv";
import bytes from "bytes";

const ajv = new Ajv({
  // some properties
});

const maxFileSize = (maxBytes: number, data: string) => maxBytes >= data.length;

const validateMaxFileSize: Ajv.SchemaValidateFunction = (
  schema: string,
  data: string
) => {
  // schema: max file size like "512KB" or 123 (in bytes)
  // data: path to the file
  const maxBytes = bytes.parse(schema);
  const valid = maxFileSize(maxBytes, data);
  if (!valid) {
    validateMaxFileSize.errors = [
      {
        keyword: "maxFileSize",
        params: {
          limit: maxBytes,
        },
        message: `file size should be <= ${schema}`,
      },
    ];
  }
  return valid;
};

ajv.addKeyword("maxFileSize", {
  validate: validateMaxFileSize,
});
```


**Typescript compiler error messages**

```
Type '{ keyword: string; params: { limit: number; }; message: string; }' is missing the following properties from type 'ErrorObject': dataPath, schemaPathts(2739)
```

**Describe the change that should be made to address the issue?**
The problem is that some properties that we don't want to specify directly are required.
So, Ajv.ErrorObject needs to allow for partials properties in SchemaValidateFunction.

**Are you going to resolve the issue?**
I'll do it if necessary.