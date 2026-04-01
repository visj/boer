# [1221] ValidateSchema is not validating schema against custom keyword meta schema

There is a function in Ajv API `validateSchema` which is supposed to validate any given schema against the meta schema. Hence its not celar that referred meta schema in this context is meant which is added by `addMetaSchema` or any `meta schema for custom keyword `is also validated. 

Aparently `validateSchema` its not validating against custom keyword meta schema, which ideally it should. It is validating at compile time, which is not appropriate step doing it. 

Also one related question is how to add complex validation on schema which is not possible by just defining the meta schema. e.g. In below exmaple, if I want that `range` keyword to be unique across scehma, while there can be range for any number type property. 

---

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Version: 6.12.2, yes its the latest version. 

**Ajv options object**

```javascript
const ajv = new Ajv({
    allErrors: true,
	schemaId: 'auto',
	useDefaults: false,
});

```

**Custom keyword with Meta Schema**


```javascript
ajv.addKeyword('range', {
  type: 'number',
  compile: function (sch, parentSchema) {
    var min = sch[0];
    var max = sch[1];

    return parentSchema.exclusiveRange === true
            ? function (data) { return data > min && data < max; }
            : function (data) { return data >= min && data <= max; }
  },
  errors: false,
  metaSchema: {
    type: 'array',
    items: [
      { type: 'number' },
      { type: 'number' }
    ],
    additionalItems: false
  }
});
```


**Sample Schema**

```javascript
var schema = {
  "range": [2, '4'],
  "exclusiveRange": true
};
```


**Your code**

```javascript

console.log(ajv.validateSchema(schema));
console.log(ajv.errors)

```


**Validation result, data AFTER validation, error messages**

```
Validation passes and no error. 
```

**What results did you expect?**
I was expecing error from `validateSchema` since that keyword scehma is not matched against the keyword meta schema. 


**Are you going to resolve the issue?**
Yes I can if provided the direction. 