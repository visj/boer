# [1433] modifying custom keyword not working. parentData and parentDataProperty are undefined.

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/docs/faq.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
7.0.4

**Ajv options object**

<!-- See https://github.com/ajv-validator/ajv/api.md/api.md#options -->

```javascript
{} // default options
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
   "type": "array",
   "filterItems": { "type": "string" }
}
```

**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
["a", "b", 1, 2, "c", 3]
```

**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/ajv-validator/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
ajv.addKeyword({                                                                                                                                                                                                                                           
      keyword: 'filterItems',                                                                                                                                                                                                                                
      type: 'array',                                                                                                                                                                                                                                         
      modifying: true,                                                                                                                                                                                                                                       
      errors: false,                                                                                                                                                                                                                                         
      valid: true,                                                                                                                                                                                                                                           
      validate: (schema: SchemaObject, data: unknown[], _, dataCxt?: DataValidationCxt): boolean => {                                                                                                                                                         
          if (!dataCxt) {                                                                                                                                                                                                                                    
              return false;                                                                                                                                                                                                                                  
          }                                                                                                                                                                                                                                                  
          const { parentData, parentDataProperty } = dataCxt;                                                                                                                                                                                                
          parentData[parentDataProperty] = data.filter((item) => ajv.validate(schema, item));                                                                                                                                                                
          return true;                                                                                                                                                                                                                                       
      },                                                                                                                                                                                                                                                     
  });
```

**Validation result, data AFTER validation, error messages**

```
Error: Cannot set property 'undefined' of undefined
```

**What results did you expect?**
Items on array not matching the filterItems schema to be removed, without raising errors.

**Are you going to resolve the issue?**
I don't know how to solve this issue. 

dataCxt.parentData and dataCxt.parentDataProperty are set to undefined. I was not expecting that. I have checked on https://github.com/ajv-validator/ajv/blob/33722772d89b428ff167730cd7955adff3cc8a0d/spec/keyword.spec.ts#L1279 to see how I am supposed to modify data, and seems like this is the proper way. I have also tried with a compile property for keyword instead of validate function, but I get the same error.