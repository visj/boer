# [485] Improve type validation

**Problem**

1. Duplicate validation of type for type integer.
2. If there is no type-specific keyword for (one of) required type(s), these types are validated after all keywords.

Both inefficiencies prevent implementing [ajv-keywords](https://github.com/epoberezkin/ajv-errors) #100: `errorMessage` keyword does not catch type errors when type is validated after all keywords.


**Solution**

1. Schema `{type: 'integer', minimum: 1, maximum: 5}` is currently compiled to:

```
if data is a number, check that it is >= 1 and <=5, otherwise check that it is an integer.
```

Instead it should be compiled to:
```
if data is an integer, check that it is >= 1 and <=5, otherwise fail validation.
```

2. Validate all types for which there are no keywords before all keywords.