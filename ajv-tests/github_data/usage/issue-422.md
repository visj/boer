# [422] v5 patternRequired does`t find any matches considering declared pattern

Hello! it seems that `v5` `patternRequired` keyword desn't validate fields properly, or maybe i`m doing something wrong.

Im using
  ```ajv version: ^5.0.1-beta.3```

with options
```const ajv = new AJV({ v5: true });```



**JSON Schema:**

```
const schema = {
    type:       'object',
    properties: {
        provider: {
            type:       'object',
            properties: {
                name: {
                    type: 'string'
                }
            },
            patternRequired: ['name']
        }
    required: ['provider']
};

```


**JSON Data:**

```
const data = {
    "provider": {
        "name": "rest"
    },
}

```


**Your code:**

```
console.log(ajv.validate(test, data)
    ? 'Validation passed'
    : ajv.errorsText()
);
```


**Validation result, data AFTER validation, error messages:**

`patternRequired` keyword does not assert `name` property in json object in in mentioned 
different than declared in pattern.
It considers property as valid even if there is no property at all.

**What results did you expect?**
I expect that `patternRequired` keyword with `['name']` value inside should look into properties and consider json object as valid if there is property called `name` and assert if does`t.
