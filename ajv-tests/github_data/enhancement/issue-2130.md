# [2130] $data support for minContains/maxContains

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**
8.11
**What problem do you want to solve?**
It would be good:  minContains/maxContains keywords to be supported by the $data proposal
According to the docs

> $data reference is supported in the keywords: const, enum, format, maximum/minimum, exclusiveMaximum / exclusiveMinimum, maxLength / minLength, maxItems / minItems, maxProperties / minProperties, formatMaximum / formatMinimum, formatExclusiveMaximum / formatExclusiveMinimum, multipleOf, pattern, required, uniqueItems.

This yet doesn't include minContains/maxContains.

**What do you think is the correct solution to problem?**
Implement support for $data in minContains/maxContains keywords.
For example:
```typescript
{
    "type": "object",
    "properties": {
        "data": {
            "type": "array",
            "contains": {
                "properties": {
                    "foo": {
                        "const": "bar"
                    }
                }
            },
            "minContains": {
                "$data": "1/params/min_contains"
            }
        },
        "params": {
            "type": "object",
            "properties": {
                "min_contains": {
                    "type": "integer"
                }
            }
        }
    }
}

```
**Will you be able to implement it?**
Not sure, I'm quite new to this.