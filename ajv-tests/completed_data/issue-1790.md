# [1790] ValidationError for missing property even though it's not required

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.6.3

**Ajv options object**

None

**JSON Schema**

```javascript
{
  type: 'object',
  required: [ 'userId', 'metaKey', 'metaValue' ],
  properties: {
    id: { type: 'integer', minimum: 1 },
    userId: { type: 'integer', minimum: 1 },
    metaKey: { type: 'string', minLength: 1, maxLength: 30 },
    metaValue: { type: 'string' }
  },
  additionalProperties: false
}
```

**Sample data**

```javascript
{
  userId: 3840,
  metaKey: 'LAST_ACTIVITY_TIME',
  metaValue: '2021-10-15 12:19:36'
}
```

**Your code**

UserMeta is an Objection object.

```javascript
UserMeta.query()
      .insert({
        userId: currentUserId,
        metaKey: LAST_ACTIVITY_TIME,
        metaValue: toMysqlDateTime(new Date()),
      })
```

**Validation result, data AFTER validation, error messages**

```
ValidationError: id: should be integer
```

**What results did you expect?**

No error

**Additional info**

This was working fine until recently. I didn't update any packages and I checked all my recent code carefully. Below is part of the compiled validation function produced by Ajv. It's not allowing `id` to be `undefined`:

```
var data1 = data.id;
var errs_1 = errors;
if ((typeof data1 !== "number" || (data1 % 1) || data1 !== data1)) {
    var err = {
        keyword: 'type',
        dataPath: (dataPath || '') + '.id',
        schemaPath: '#/properties/id/type',
        params: {
            type: 'integer'
        },
        message: 'should be integer'
    };
    if (vErrors === null)
        vErrors = [err];
    else
        vErrors.push(err);
    errors++;
}
if ((typeof data1 === "number")) {
    if (data1 < 1 || data1 !== data1) {
        var err = {
            keyword: 'minimum',
            dataPath: (dataPath || '') + '.id',
            schemaPath: '#/properties/id/minimum',
            params: {
                comparison: '>=',
                limit: 1,
                exclusive: false
            },
            message: 'should be >= 1'
        };
        if (vErrors === null)
            vErrors = [err];
        else
            vErrors.push(err);
        errors++;
    }
}
```