# [647] "$async": true should persist consistently through $refs (?)

version: ajv@6.0.0-rc.1 plus ajv-async@beta

```javascript
var ajv_options = {
    allErrors: false,
    verbose: true,
    useDefaults: true,
    jsonPointers: true,
    async: true
};

```

When I define async custom keyword xxx_fetch (which works fine)
the schema below provokes this error:

```code
...\ajv\lib\dotjs\validate.js:94
    if ($async && !it.async) throw new Error('async schema in sync schema');

Error: async schema in sync schema

    at Object.generate_validate [as validate] (...\node_modules\ajv\lib\dotjs\validate.js:94:36)
    at Object.generate_ref [as code] (...\node_modules\ajv\lib\dotjs\ref.js:70:22)
    at Object.generate_validate [as validate] (...\node_modules\ajv\lib\dotjs\validate.js:261:37)
    at Object.generate_properties [as code] (...\node_modules\ajv\lib\dotjs\properties.js:188:26)
    at generate_validate (...\node_modules\ajv\lib\dotjs\validate.js:334:35)
    at Ajv.localCompile (...\node_modules\ajv\lib\compile\index.js:86:22)
    at Ajv.resolve (...\node_modules\ajv\lib\compile\resolve.js:54:19)
    at Object.resolveRef (...\node_modules\ajv\lib\compile\index.js:187:21)
    at Object.generate_ref [as code] (...\node_modules\ajv\lib\dotjs\ref.js:21:22)
    at Object.generate_validate [as validate] (...\node_modules\ajv\lib\dotjs\validate.js:261:37)
```

**JSON Schema**

```json
{
    "$async": true,
    "properties": {
        "foo": { "$ref": "#/definitions/Foo" }
    },
    "definitions": {
        "Foo": {
            "properties": {
                "bar": { "$ref": "#/definitions/Bar" }
            }
        },
        "Bar": {
            "properties": {
                "blitz": {
                    "xxx_fetch": "string"
                }
            }
        }
    }
}

```

Adding "$async": true to "Bar" does _not_ help

```json
{
    "$async": true,
    "properties": {
        "foo": { "$ref": "#/definitions/Foo" }
    },
    "definitions": {
        "Foo": {
            "properties": {
                "bar": { "$ref": "#/definitions/Bar" }
            }
        },
        "Bar": {
            "$async": true,      //_DOES_NOT_HELP
            "properties": {
                "blitz": {
                    "xxx_fetch": "string"
                }
            }
        }
    }
}

```
but adding $async to Foo _does_ help
```json
{
    "$async": true,
    "properties": {
        "foo": { "$ref": "#/definitions/Foo" }
    },
    "definitions": {
        "Foo": {
            "$async": true,      //_FIXES_THE_PROBLEM_(note_no_$async_in_'Bar')
            "properties": {
                "bar": { "$ref": "#/definitions/Bar" }
            }
        },
        "Bar": {
            "properties": {
                "blitz": {
                    "xxx_fetch": "string"
                }
            }
        }
    }
}

```

It takes _two_ levels of $ref to lose track of $async.
The following does NOT cause an error:
```json
{
    "$async": true,
    "properties": {
        "foo": { "$ref": "#/definitions/Bar" }  //_'SKIPPING'_Foo_AVERTS_Async_ERROR
    },
    "definitions": {
        "Foo": {
            "properties": {
                "bar": { "$ref": "#/definitions/Bar" }
            }
        },
        "Bar": {
            "properties": {
                "blitz": {
                    "xxx_fetch": "string"
                }
            }
        }
    }
}

```

My first thought is that once $async=true is set, it should
remain in effect until explicitly disabled.  At least for references
to "#/definitions" in the same object, yes?

Second thought is that putting "$async": true into "leaf"
portion of schema ought to avert error, but doesn't.

Is there any way I can avoid decorating every portion of
my schema that might be part of a chain of $ref's with
"$async": true ?

Thanks much for any advice!

(I confess I don't actually understand why "$async" is a schema
keyword (custom to ajv) at all.  Why isn't $async just an option
to Ajv or ajv.compile?)