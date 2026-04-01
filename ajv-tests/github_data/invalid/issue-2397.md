# [2397] Description key set as boolean returns error that it must be string

**What version of Ajv are you using?

8.12.0 

**Ajv options object**

```
{
  "description": {
    "type": "boolean"
  }
}
```

**JSON Schema**

```json
{
    "description": true
}
```

**Validation result, data AFTER validation, error messages**

```
core.ts:519 Uncaught Error: schema is invalid: data/description must be string
    at Ajv.validateSchema (core.ts:519:18)
    at Ajv._addSchema (core.ts:721:30)
    at Ajv.compile (core.ts:384:22)
    at validateDefaultConfiguration (AddonConfigurationSchema.vue:323:26)
    at reader.onload (AddonConfigurationSchema.vue:293:13)
```

**What results did you expect?**

I would expect it to not return an error, cause the description key is correctly set as a boolean. When I change both `description` keys to something else (like `sampleDescription`) then it works fine. 

I also get the error if I change the type to a string in both places, seems like as soon as I am using a key with the name `description` I get the error, and it works fine if i don't use a key `description`. Is this a reserved word perhaps? 

Any idea on what's causing this? 
