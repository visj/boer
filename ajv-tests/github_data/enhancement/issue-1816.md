# [1816] Fail Fast flexibility when using All Errors

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

### What version of Ajv you are you using?
8.6.3

### What problem do you want to solve?
This is a feature/change request, but any advice on how to better handle this problem with what's already there would be greatly appreciated as well. Either way, say I have the following schemas and data:

**schemas**
``` json
[{
    "$id": "array-checker",
    "type": "array",
    "minItems": 10,
    "contains": { "$ref": "user-42" }
},
{
    "$id": "user-42",
    "type": "object",
    "required": [ "id", "name" ],
    "properties": {
        "id": { "const": 42 },
        "name": { "const": "Garry" }
    }
}]
```

**invalid data**
``` json
[
    { "id": 1, "name": "John" },
    { "id": 2, "name": "Jane" }
]
```

When I run `array-checker` against the above data with the `allErrors` option, I get the following error messages:
> data must NOT have fewer than 10 items, data/0/id must be equal to constant, data/1/id must be equal to constant, 
data must contain at least 1 valid item(s)

I'd argue that in terms of message accuracy, this doesn't capture my intent with using `contains`, and I'd imagine it doesn't for most use cases of it either. I'm trying to check two things about this array: That it has at least 10 items, and that at least one of those items looks a certain way, hence the need for `allErrors`. However, this labels the array *elements* as incorrect, similar to how `items` would, even though that's not really the case. None of these elements are incorrect, it's the *array* that's incorrect. 

Additionally, if `user-42` was a substantially larger schema, this would burn a lot more CPU cycles. So far, I've tried getting around this through a combination of `if/then/else` and the [ajv-errors](https://github.com/ajv-validator/ajv-errors) package, but these both have their issues. `if/then/else` makes the schema a little harder to understand and adds its own redundant error messages, and ajv-errors has its own limitations. I've also tried manually omitting errors underneath contains based on the `schemaPath`, but I think as mentioned in https://github.com/ajv-validator/ajv/issues/1662, due to the use of `$ref` the full path isn't provided.

### What do you think is the correct solution to problem?

The first thing I can think of is allowing for another value in the `allErrors` option. This value could be a string such as `"contains"`, which would be equivalent to `allErrors: true` in all cases except when using the `contains` keyword, at which point any JSON Schema underneath would be equivalent to `allErrors: false`. Presumably this also wouldn't be a a breaking change as it's a new option value.

While I think this solves the issue in a lot of cases (and in cases where it doesn't, it would still simplify certain workarounds), I think it's just symptomatic of a larger issue, which is the inflexibility of allErrors. Sometimes I want fail-fast, and sometimes I don't. In theory, flexibility could be achieved with a new keyword, potentially one part of [ajv-keywords](https://github.com/ajv-validator/ajv-keywords), and would allow `allErrors` to be overridden for any schemas it's placed in. However, I'm not sure the `addKeyword` method gives enough control to allow this. 

Or, and perhaps this is just wishful thinking, would there be value in petitioning the JSON Schema spec to reserve a meta keyword just for implementation-specific options? e.g. `$implementation` could be an object of whatever key-value pairs you want. It would then be up to the implementation to choose how this object is used, such as allowing `allErrors` to be overridden at different levels. Would probably be do a lot for flexibility, if feasible. 

### Will you be able to implement it?
Not likely, but would be open to discuss