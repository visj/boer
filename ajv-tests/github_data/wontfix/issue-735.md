# [735] Float64Array or Float32Array fail validation against "array" type

Hello I'm using ajv to validate user input for a 3D renderer and I have arrays that are actually Float64Array. they are declared as "array" in the Json Schema and I thought it would work.
Here is a simplified test case that demonstrates the issue: 

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.2.1


**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
{ allErrors: true }
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```javascript

      var schema =  {
            type: 'object',
            properties: {
                vec3: {
                    type: 'array',
                    minItems: 3,
                    maxItems: 3,
                    items: { type: 'number' }
                }
            },
            required: ['vec3']
        };
```

**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```javascript
       var obj = {
            vec3: new Float64Array(3)
        };

```


**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/epoberezkin/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript

        var validator = new Ajv({ allErrors: true }).compile(schema);
        var valid = validator(obj);
        if (!valid) {
            console.log(validator.errors, obj, schema);
        }
```


**Validation result, data AFTER validation, error messages**

```
{keyword: "type", dataPath: ".vec3", schemaPath: "#/properties/vec3/type", params: {…}, message: "should be array"}

```

**What results did you expect?**
I'm not sure if validating Float64Array or Float32Array against "array" is 100% valid with the Json Schema spec. But since there is no way to specify the specific type in the schema (or maybe there is?), I'd expect they'd be considered as arrays.

**Are you going to resolve the issue?**
For now my workaround is to ignore the error in my validation process, since I expect it, but it would be really nice that it works out of the box.
