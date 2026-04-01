# [490] Integer validation error

I use ajv@5.1.0.

**Ajv options object**
```javascript
{}
```


**JSON Schema**
```json
{
  "type": "integer",
  "minimum": 0
}
```


**Sample data**

```json
"abc"
```

In node REPL:

```javascript
> const Ajv = require('ajv');
undefined
> const validator = (new Ajv({})).compile({type: 'integer', minimum: 0});
undefined
> validator(1);
true
> validator('1');
true
> validator('abc');
true
```

**What results did you expect?**
Expect to validate integer.
