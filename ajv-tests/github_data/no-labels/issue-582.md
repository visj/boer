# [582] Ability to remove failing fields [Feature request][question]

**What version of Ajv you are you using?**
v5.2.2

**What problem do you want to solve?**
I want to add custom keywords to my JSON schemas, that I can later use to filter the data by
example schema:
```json
{ 
  "type":"object",
  "properties": {
     "name": { "type": "string", "filterLevel": 0},
     "mobileNumber": {"type": "string", "filterLevel": 2}
  }
}
```
The idea being that, after validate an object, I can also filter away fields that do not meet a required `filterLevel`.

I want the filter description to be _in_ the json schema of the data objects, because it makes it a lot easier to keep all my data structure definitions in one place.
Which leaves me to either create my own schema parser (which is fairly daunting considering the flexibility of the JSON Schema Spec), or try to utilise an existing schema validator to offload the heavy work.

**What do you think is the correct solution to problem?**
similar to the `removeAdditional` option that already exists, it would be useful to have a `removeFailing` option, which could remove any fields that are failing the validation, but are not marked as essential by the schema.
With this, I could add a custom keyword to the schema which I can cause to fail on dataFields when I need.

I have already tried an alternative method, wherein I manually parse through a given schema and try to strip out field definitions of fields below the `filterLevel`, then rely on `removeAdditional` to remove the properties that aren't present in the *modified* schema.
However, this quickly go messy when I had to start using `allOf` and `anyOf` in my schemas.

**Will you be able to implement it?**
I haven't looked into your code-base fully yet, so I can't say.
I was mainly asking this feature request in case there was a "well here's a way of doing it using the existing system" answer available, or a pointer to something else that would fulfill my criteria. If there isn't a known solution, I can try to look into the ajv code-base to see how I would implement such a feature.