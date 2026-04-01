# [705] trim, lowercase, ...

I'd like to modify (trim, lowercase, cast to ObjectId) some data after checking their type but before the format.
I've created few custom keywords:
**lowercase:**
```
{
  errors: false,
  compile: (schema, parentSchema) => {
    if (!schema) {
      return _.constant(true);
    }
    if (parentSchema.type !== 'string') {
      return _.constant(false);
    }
    return (value, objectKey, object, key) => {
      if (_.isString(object[key])) {
        object[key] = object[key].toLowerCase();
      }
      return true;
    };
  }
}
```

**trim:**
```
{
  errors: false,
  compile: (schema, parentSchema) => {
    if (!schema) {
      return _.constant(true);
    }
    if (parentSchema.type !== 'string') {
      return _.constant(false);
    }
    return (value, objectKey, object, key) => {
      if (_.isString(object[key])) {
        object[key] = object[key].trim();
      }
      return true;
    };
  }
}
```

It works but if I specify a format (email), the value is compared to the format before the trim/lowercase modification.

Here is my schema property: `"email": { "type": "string", "format": "email", "lowercase": true, "trim": true }`