# [1431] Disable coercion at property level

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/docs/faq.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv you are you using?**

7.0.3

**What problem do you want to solve?**

In the majority of cases, coercion is great. There are however some situations where it is not expected. For example, I have a `mode` property for a function similar to `chmod` which can either be a string or a number. I do not want the string mode `"644"` to be converted to the integer `644` but to `0o0644`. At the same time, the function is ok to accept a symbolic representation like `"rw-r--r--"`. In this case, I do not want strings to be converted to integers nor do I want integers to be converted to strings.

**What do you think is the correct solution to problem?**

We could simply have a `coercion` or `$coercion` keyword in a property which disable coercion. It is then the responsibility of the user to do it. For example

```json
{
  "type": "object",
  "properties": {
    "mode": {
      "type": ["integer", "string"],
      "$coercion": false
    }
  }
}
```

**Will you be able to implement it?**

I don't think so, this seems to go deep into the architecture. However, with some pointer, I'll be happy to dive into.