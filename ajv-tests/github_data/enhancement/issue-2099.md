# [2099] Coerce string of Intl formatted number -> number

**What version of Ajv you are you using?**
8.11.0
**What problem do you want to solve?**
Ability to coerce strings containing numbers formatted using other notations, based on locale

`"1,234.56" -> 1234.56`
`"1 234.56" -> 1234.56`
`"1.234,56" -> 1234.56`
`"1 234,56" -> 1234.56`

**What do you think is the correct solution to problem?**
Options:
a) To ensure there are minimal perf ramifications, the ability to have the ability override the type coerce function. However, this is the only use case I can think of that would apply to any of the types.
b) Add a `locale` and `coerceLocaleNumber` to the options, and have a condition to use a slower algorithm See below in ref section). This would apply to all number coerceTo, which may be unwanted.
c) New `ajv-keyword`, or extend `transform` keyword
d) Add new `format: "formattedNumber"` to the spec with a `locale` ajv option (or in the spec some how?), and use that as an indicator to choose coerce method.

I think something along the lines of `d)` might be the cleanest. But can start with `c)`.  I can see this leading to a larger discussion around the use of locale with JSON-schema for number, date, and enum lists.

Would be interested to hear others thoughts on this.

**Will you be able to implement it?**
possibly

Ref:
- https://github.com/json-schema-org/community/discussions/242
- https://stackoverflow.com/questions/29255843/is-there-a-way-to-reverse-the-formatting-by-intl-numberformat-in-javascript
- https://stackoverflow.com/questions/55364947/is-there-any-javascript-standard-api-to-parse-to-number-according-to-locale