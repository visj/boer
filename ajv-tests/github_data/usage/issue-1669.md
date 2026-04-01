# [1669] Using `allOf` and `nullable` in combination yields unexpected validation errors

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
I am using [oas3-chow-chow](https://github.com/atlassian/oas3-chow-chow/blob/f7d2e6f1021e835450535609ddbc31faa6661b9b/package.json#L29) which is using version `^6.12.3`

**Ajv options object**
oas3-chow-chow defines the AJV options [as seen here](https://github.com/atlassian/oas3-chow-chow/blob/f7d2e6f1021e835450535609ddbc31faa6661b9b/src/compiler/ajv.ts).

```typescript
const options: Ajv.Options = {
  /**
   * Ignore following formats for now because they are not supported by AJV by default.
   * TODO: Add custom format supports for following formats.
   */
  unknownFormats: [
    'int32',
    'int64',
    'float',
    'double',
    'byte',
    'binary',
    'password',
  ],
  nullable: true,
  jsonPointers: true,
};

export default function ajv(opts: Ajv.Options = {}) {
  return new Ajv({
    ...options,
    ...opts,
  });
}
```

**JSON Schema**
Unfortunately I'm locked into using OAS 3.0.x and have to use the `"nullable": true` declaration

```json
"MyArrayOfReferences": {
    "type": "array",
    "example": [
      "prefix/14691d5de8f424c75558dd7375",
      "prefix/6591827d39d443e983199e1cb7",
      "prefix/ec403e0c81074d8db34a6c9431"
    ],
    "items": { "type": "string" }
},
"UpdateMyArrayOfReferences": {
    "properties": {
        "myArrayOfReferences": {
          "description": "Group settings. Set to `null` to remove.",
          "allOf": [
            {
              "$ref": "#/components/schemas/MyArrayOfReferences"
            }
          ],
          "nullable": true
        }
    }
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    "myArrayOfReferences": null
}
```

**Validation result, data AFTER validation, error messages**

```
"dataPath": "/myArrayOfReferences",
"error message": "RequestValidationError: Schema validation error: type should be array",
```

**What results did you expect?**
I expect to be able to provide a `null` value without producing a validation error.


It seems related to this issue #983 because if I remove the `$ref` and make everything inline, then the `null` value is accepted.