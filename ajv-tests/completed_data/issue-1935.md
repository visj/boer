# [1935] `strictTypes` does not expect "narrowing" `integer` with number keywords

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.10.0
With all included schemas (default, 2019, 2020)

**Ajv options object**

```ts
{ strictTypes: true }
```

**JSON Schema**

```json
{
    "type": "number",
    "if": {
        "type": "integer",
        "maximum": 5
     },
     "else": {
         "minimum": 10
     }
}
```

In english:
A number that must be an integer <= 5, or any number >= 10.

**Sample data**

Resolves as follows if `strictTypes` is `'log'` or `false`
```json
4 // valid
4.5 // invalid
7 // invalid
11.5 // valid
"" // invalid
null // invalid
```

**Your code**

```ts
new Ajv({ strictTypes: true }).compile({
    type: 'number',
    if: {
        type: 'integer',
        maximum: 5
     },
     else {
         minimum: 10
     }
});
```

**Validation result, data AFTER validation, error messages**

```
Error: strict mode: missing type "number" for keyword "maximum" at "#/if" (strictTypes)
```

**What results did you expect?**
No error message.

Documentation of [`strictTypes`](https://ajv.js.org/strict-mode.html#strict-types)
> "number" vs "integer"
> Type "number" can be narrowed to "integer", the opposite would violate strictTypes.

`maximum` is a valid keyword for `integer` type, which is a "narrowing" of `number`.

Note that the `else` does not error on missing `type: 'number'` and the error goes away if `type: 'integer'` is removed (as type is properly inferred from parent schema).  Error also goes away if `maximum: 5` is removed.

Dropping `type: 'integer'` or `maximum: 5`, would logically alter schema, as above examples of 4.5 and 7 would then be valid.

**Are you going to resolve the issue?**
Current local solution for me is to drop `strictTypes` (which does not impact validation, but is an overall appreciated feature).

I'd be open to taking a swing at resolving, but would probably need some serious guidance on where to even start.