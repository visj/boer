# [1692] How to return the property in question

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

`8.6.2`


**Ajv options object**

```javascript
{ allErrors: true }
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
   "type":"object",
   "properties":{
      "rank":{
      "type":"string"
      },
      "entity_types":{
         "type":[
            "string",
            "array"
         ]
      },
      "country":{
         "type":"string",
         "nullable":true
      },
      "region":{
         "type":"string",
         "nullable":true
      },
      "start_date":{
         "type":"string"
      },
      "end_date":{
         "type":"string"
      },
      "top":{
         "type":"string",
         "nullable":true
      }
   },
   "required":[
      "rank",
      "entity_types",
      "start_date",
      "end_date"
   ],
   "additionalProperties":false
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
rank=popularity&entity_types=person&region=Europe&country=Germany&end_date=2021-06-15&top=10
```

**Your code**

```javascript
    const validate = ajv.compile(LeaderboardQuerySchema);
    if (validate(req.query)) {
        console.log("NO ERROS");
    } else {
        console.log(validate.errors);
    }
```

**Validation result, data AFTER validation, error messages**

```
[
  {
    instancePath: '',
    schemaPath: '#/required',
    keyword: 'required',
    params: { missingProperty: 'start_date' },
    message: "must have required property 'start_date'"
  },
  {
    instancePath: '/top',
    schemaPath: '#/properties/top/type',
    keyword: 'type',
    params: { type: 'number' },
    message: 'must be number'
  }
]

```

**What results did you expect?**

Its difficult to determine what the property in question for each error is referring to. In the old version i used `dataPath` but in the newer version its no longer available. For the first error i have to get `params.missingProperty` to be able to get the property in question `start_date` and the for the second error i have to parse instancePath to get the property in question `top`.  My problem is there is no consistent way to display the property in question back to the user. Is there some way i can return the property as a simple as possible. e.g 

```
[
  {  property: start_date, message: "must have required property 'start_date"}
  {  property: top, "must be number" },
]
```