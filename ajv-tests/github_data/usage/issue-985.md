# [985] Add Keyword, regex not triggered

So, i'm trying to add some test to check a path and evaluate if I need to use the first regex or the other.

Problem is that the addKeyword is never trigger.


**JSON Schema**

```json
{
  "type": "object",
  "properties": {
    "pathToGet": {"type": "string"},
    "jsonPath": {"type": "boolean"}
  }
};
```

**Sample data**

```json
{
  "pathToGet": "tefhjsdf@st",
  "jsonPath":  true
};
```


**Code**

```javascript
var AJV = new ajv();
AJV.addKeyword('pathToGet', {
  type: 'string',
  compile: function (sch, parentSchema) {
  return parentSchema.jsonPath === true
    ? function (data) { return /^[a-zA-Z\.]+$/.test(data) }
    : function (data) { return  /^[a-zA-Z\.]+$/.test(data); }
  }
});
const test_v = AJV.compile(schema);
console.log(test_v(test));
console.log(test_v.errors);
```

**Validation result, data AFTER validation, error messages**

Return 'true' for first console log
Return 'null' for first console log

```sh
true
null
```

**What results did you expect?**

I expect to get
``` sh
false
#SOME ERROR
```
