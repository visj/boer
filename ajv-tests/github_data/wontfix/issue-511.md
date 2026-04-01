# [511] Get required

I have a schema with conditionals "allOf" where one is required if a condition is set, for example Name starts with "A".

```
    {
      "if": {"properties": {"name": {"pattern": "^A"}}},
      "then": {"required": ["age"]}
    },
```

I want to show a "*" on the label of all required. I would like to avoid to have same logics implemented twice, both on the form and then on the schema.

Can I get if something is required from AJV matching schema to validation?

for example something like this:

```
const isAgeRequired = checkIsRequired(mySchema, data, 'age')
....
<label>Age {isAgeRequired && '*'}</label>
```

