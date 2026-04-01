# [2102] Cannot serialize and then parse int32 type

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
    "foo": { "type": "int32" }
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
const data = parser(serialize({}))
```

**What results did you expect?**

```js
// data to be:
// {
//   foo: undefined
// }
```

But got:
```js
// data is:
// undefined
```