# [272] [Request] selective validation

Pardon if this has been addressed. There's a broad use case here that I don't think ajv covers:

Let's say you have a schema defined for a large user input form.

The user completes the form one section at a time. Each section is validated before he's allowed to move on.

How do you validate each section without either:
1. creating separate schemas (which runs afoul of SoC, ties the UI to the schema, complicates validation with `$ref` + `required`)
2. validating the entire form every time there's a change (which will hit sections not encountered yet and is unnecessary)

What if we could just check a list of fields?
`validate(data, { fields: ['foo', 'bar'] })`

This would keep `required: [...]` directives in place for the larger and immediate scope, maintain one central source of truth for the validator,  and would  be another point in favor of speed, if nothing else.

Each field would selectively run the validator on itself, and it would always be in the context of the parent schema. 
