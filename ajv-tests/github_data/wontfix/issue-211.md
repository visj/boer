# [211] partial validation support

Hi there, another question here that perhaps stretches the intention of the module! I was wondering if you would consider adding support for so called "partial" validation. Suppose I have the following schema:

```
{
  "type": "object",
  "properties": {
    "first": { "type": "string" },
    "second": {
     "type": "object",
     "properties": {
       "some": { "type": "string" },
       "otherProperties": { "type": "string" }
     }
   }
  },
  "required": [ "first", "second" ]
}
```

And I use that as a schema for an entire record that I provide CRUD actions for. I might have a case where I want to support a `PATCH` (or even just update via `PUT`) to update part of the document, and still want to validate the data however without submitting _all_ the data. Currently submitting a payload of `{ second: { some: 'hello', otherProperties: 'world!' } }` would fail validation because `first` is not present.
