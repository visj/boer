# [967] Feasibility of adding custom types

Adding custom validation now only implements format validation via ``addFormat``, whether to consider adding custom types for more convenient type definitions.

Use a custom type ``ObjectId``.
```json
{ _id:  { type: "ObjectId" } }
```

validation.
> this is mongodb Objectid.
```js
{ _id: xxx._id  }
```

This way to implement any type I want through a custom type.
