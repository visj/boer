# [2171] JDT Serialization with Only Additional Properties fails

My JTD schemas contain records that have either only `additionalAttributes: true` (i.e. no fixed internal structure) or `optionalAttributes` with `additionalAttributes: true` (where we want type safety for some attributes and pass others through). Serialization always fails in the first case and also in the second if no `optionalAttributes` are set in the data. This issue is very likely related to https://github.com/ajv-validator/ajv/issues/2001 but that one only mentions `optionalProperties`.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.11.2

**Ajv options object**

not dependent on options

**JSON Schema**

schema1
```json
{ 
  "properties": {},
  "additionalProperties": true
}
```

Same result with `optionalProperties` instead of `properties` (schema2)

schema3
```json
{
  "optionalProperties": {
    "prop_not_in_data": { "type": "string" }
  },
  "additionalProperties": true
}
```


**Sample data**

```json
{
  "a":1,
  "b":2
}
```

**Your code**

```javascript
var serialize1 = ajv.compileSerializer(schema1)
var serialize2 = ajv.compileSerializer(schema2)
var serialize3 = ajv.compileSerializer(schema3)

console.log("serialize1", serialize1(data))
console.log("serialize2", serialize2(data))
console.log("serialize3", serialize3(data))
```

https://runkit.com/fabianeichinger/637bc56844c590000adfb57d

**Serialization output**

serialize1: `{"a":1"b":2}`
serialize2: `{"a":1"b":2}`
serialize3: `{,"a":1,"b":2}`

**What results did you expect?**
Valid JSON

**Are you going to resolve the issue?**
Would love to test if this is resolved by https://github.com/ajv-validator/ajv/pull/2028. Can't get the build to work on my machine, getting some TS errors on npm install.