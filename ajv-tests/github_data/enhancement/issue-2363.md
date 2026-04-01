# [2363] Disable reportTypeError to enable users to implement their own coercion rule

I manage to implement my own coercion rules. The values are correctly coerced. However, I have to define in the schema all the types that may be coerced or an error is thrown by [`reportTypeError`](https://github.com/ajv-validator/ajv/blob/master/lib/compile/validate/dataType.ts#L49). Here is how I format the error in [Nikita](https://nikita.js.org/):

```
Error: NIKITA_SCHEMA_VALIDATION_CONFIG: one error was found in the configuration of root action: #/definitions/config/properties/from_string/type config/from_string must be number, type is ["number"].
```

Please provide us a way to disable calling `reportTypeError`. For information, this issue has bugged me (and my libraries) for years and is related to issue #1437.
