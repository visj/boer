# [2255] Better error messaging for NOT

**What version of Ajv you are you using?**
8.11.0

**What problem do you want to solve?**
I have a schema with a `not` clause which, on failure, returns a very unhelpful/confusing message: `my-schema.json/thing must NOT be valid`

```json
"thing": {
    "type": "number",
    "not": {
        "exclusiveMinimum": -0.25,
        "exclusiveMaximum": 0.25
    }
}
```

**What do you think is the correct solution to problem?**
I think the correct messaging would be something along the line of what it would say if the criteria was not wrapped in a `not`. Something like:
```
my-schema.json/thing must NOT be < 0.25, my-schema.json/thing must NOT be > -0.25
```

**Will you be able to implement it?**
Unsure