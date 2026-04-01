# [2187] Removing schema by key reference doesn't remove the schema reference by id

When removing a schema by key, you can still get the schema by id or vice versa.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.11.2

**Ajv options object**
No options

**JSON Schema**
With any schema
```javascript
const schema = {
    $id: "id",
    type: "object",
    properties: {
        nested: {
            type: "number",
        },
    },
};
```

**Your code**

```javascript
ajv.removeSchema("id");
console.log(schemas()); // ['key']
console.log(ajv.getSchema("key")?.schema); // schema found {"$id": ...}
console.log(ajv.getSchema("id")?.schema); // undefined
```
run again but with key ref:
```javascript
ajv.removeSchema("key");
console.log(schemas()); // []
console.log(ajv.getSchema("key")?.schema); // undefined
console.log(ajv.getSchema("id")?.schema); // schema found {"$id": ...}
```

**What results did you expect?**
When removing a schema by id or key it should remove both references by key and id.
