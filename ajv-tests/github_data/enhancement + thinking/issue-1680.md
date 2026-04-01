# [1680] Question: Is there a way to supply multiple schemas for compilation?

I have a set of growing and somewhat redundant schemas that I'd like to break down into smaller "main" schemas with _shareable_ "subschemas" using the `$ref` keyword.  The schemas needed by the application would all be known at initialization time; I have no need for dynamic loading of schemas.  

With my current (large) schemas, I call the `compile` function once at initialization/module load time as suggested [here](https://ajv.js.org/guide/managing-schemas.html#re-using-validation-functions).

```js
    const ajv = new Ajv({ allErrors: true })
    const validate = ajv.compile(myBigOriginalSchema1) 
```

After reading [the documentation](https://ajv.js.org/guide/combining-schemas.html#a-name-ref-a-combining-schemas-with-ref) and the API reference I'm unclear (I'm sorry) on whether there is a way to have `ajv` compile multiple schemas at once (or whether that is even advisable).  I notice the `compile` function only takes a single schema.

For example, I tried this, with `addSchema`:
```js
    const ajv = new Ajv({ allErrors: true })
    ajv.addSchema(mySubschema1)
    ajv.addSchema(mySubschema2)
    const validate = ajv.compile(mySmallerMainSchema1) 
```

...and I looking at the source, I don't believe it compiles the other schemas added via `addSchema` at the time of the `compile` call.

I also read [here](https://ajv.js.org/api.html#ajv-addschema-schema-object-object-key-string-ajv) that the `addSchema` function itself doesn't actually compile the schemas by design, until they are first needed.  In my use case I KNOW these subschemas will very likely used on the first validation attempt.  Breaking the large single schema down into a bunch (e.g. a dozen) subschemas will likely mean I am deferring most/all the compilation to the first validation attempt instead of compiling at initialization.  Is my understanding correct?  Is what I have above the most efficient approach?  Is there a way to compile multiple schemas at initialization time instead?

I also experimented with the following, but I'm not sure it's any different...I thought the constructor simply called `addSchema` on each schema given:

```js
    const ajv = new Ajv({ allErrors: true, schemas: [mySubschema1, mySubschema2] })
    const validate = ajv.compile(mySmallerMainSchema1) 
```

Just to further try and illustrate what I'm asking about, I almost want to do something like this, but the `compile` function needs a schema argument:

```js
    const ajv = new Ajv({ allErrors: true, schemas: [mySmallerMainSchema1, mySubschema1, mySubschema2] })
    const validate = ajv.compile() //needs a schema here, obviously
```

...OR like this, but I know this argument isn't supported either:

```js
    const ajv = new Ajv({ allErrors: true })
    const validate = ajv.compile({ schemas: [mySmallerMainSchema1, mySubschema1, mySubschema2] })  //only one allowed
```

Any advice is appreciated.  And if I am missing the point of how subschemas and `$ref` are supposed to be used, please let me know.

Thank you for creating & maintaining a useful library in `ajv`.