# [399] Coercing individual properties

**JSON Schema (please make it as small as possible to reproduce the issue):**

```json
{ "type": "string", "coerce": { "type": "number", "minimum": 0, "maximum": 100 } }
```

**Data (please make it as small as possible to reproduce the issue):**

```json
"101"
```

**What results did you expect?**

This schema is attempting to validate that a string is within the range from 0 to 100, after it is converted to a number. In this case, because the numeric value of the string is greater than 100, it should create an error.

The `coerceTypes` config property will cause other errors in my schema (not shown in the example) where it should not automatically coerce the type. I need the ability to coerce individual properties in a schema from strings to numbers, without enabling global coercion. 

I looked at the `addKeyword` docs, but it wasn't immediately clear how to change a value and then validate that value as if it was a different type. I can continue to work on this problem if a little guidance is provided.
