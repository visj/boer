# [159] Compatibility with Meteor

I get this error:

`async schema referenced by sync schema`

with this code:

```
if(!ajv.validate(personSchema, personToInsert)){
    return ajv.errors;
};
```

I have no idea what this means.  This whole thing looks synchronous to me, and I don't know what an async schema is.

Note: this is all run in a MeteorJS fiber.

Any help would be appreciated.
