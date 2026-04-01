# [2218] Export UncheckedPropertiesSchema

**What version of Ajv you are you using?**
8.12.0

**What problem do you want to solve?**
I want to create utility libraries to make working with JSONSchema easier. For example, I want to be able to create a basic `toSchema` function that looks something like:
```
const toSchema = <T>(properties: UncheckedPropertiesSchema<T>): JSONSchemaType<T> => {
  return {
    type: 'object',
    properties,
    required: []
  }
}
```

**What do you think is the correct solution to problem?**
Exporting more of the types used to construct JSONSchemaType

**Will you be able to implement it?**
yep, pretty sure this is a one line change
