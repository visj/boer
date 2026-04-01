# [625] Make ajv chainable

Thank you for providing this great and awesome library.

I would like to ask for the following improvement. 

What do you think about making some ajv method returning `this`, that would allow to write more compact code by chaining methods. For example the following code would be possible:

```javascript
const validator = new Ajv()
    .addSchema(someSchema)
    .addMetaSchema(someMetaSchema)
    .addFormat('customeType', customValidator)
    .getSchema('customUri')

if (!validator(someJsonObject)) { // fail }
```

As far as i can see candidates for chaining would be `addSchema`, `addMetaSchema`, `addFormat`, `addKeyword`.