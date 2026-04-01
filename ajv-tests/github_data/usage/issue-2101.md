# [2101] Parse and serialize produces unexpected "undefined" string

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Using version 8.11.0

**Ajv options object**


```javascript
const ajv = new Ajv()
```

**JSON Type Definition (JTD)**

```json
{
  "properties": {
    "foo": { "type": "string" }
  }
}
```

**Sample data**

```json
{}
```

**Your code**


```javascript
const serialize = ajv.compileSerializer(schema)
const parser = ajv.compileParser(schema)
parser(serialize({}))
```

**What results did you expect?**

```js
{
  foo: undefined
}
```

But got:
```js
{
  foo: "undefined"
}
```