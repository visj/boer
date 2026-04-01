# [779] throws instead of returning boolean

Honestly this is fairly unexpected..
I have this:

```js
try {
    const valid = ajv.validate(schema, data);
    console.log('is schema valid:', valid);
 }
 catch(err){
    console.error(err.message);
 }
```

looking the API, I didn't expect it to ever throw, only to return a boolean if the data matched the schema. If the schema is bad or data is bad it seems to throw.

So my question is, will `ajv.validate()` ever return false? When will it throw, and when will it return false? It makes no sense lol.