# [755] Idea: Coerce value case to match enum value case

We had a client today that wanted the ability to be able to have enum validation not be case-sensitive. Great in theory, but only adds to bad data problem and increases the complexity of the code behind the validation step. After the meeting, I had the idea - what if we coerced the data to match the string in the enum list. This would allow poor quality data to be uploaded from 3rd parties and be sanitized during validation. See example below.

Curious if others have run into this or think this might be useful.

If this was built it could look like this:
**Ajv options object**
```javascript
var ajv = new Ajv({ coerceTypes: ['array','enum']] });

```
**JSON Schema**
```json
{
  "type":"array",
  "items": {
    "type":"string",
    "enum":["pH"]
  }
}
```
**Sample data**
```json
["ph","PH","pH","Ph"]
```

**Validation result, data AFTER validation, error messages**
```
valid == true
["pH","pH","pH","pH"]
```