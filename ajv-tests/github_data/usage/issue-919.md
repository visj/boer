# [919] coercion of nullable empty string

Using ajv 6.6.2, coerceType 'array'.

Schema:
```
type: 'string',
nullable: true,
format: 'a format that does not allow empty string, by the way'
```
What happens: Coercion rules keep the empty string.
What i'd like: Coercion rules converts empty string to null

However i totally understand that using anyOf[null, string] is a solution, but nullable documentation does not define coercion, so i suppose it's up to ajv to decide what's best, or even maybe to provide a coercion option (nullable first or last).


