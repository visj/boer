# [2481] Add support for comments inside JSON

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**
v8.17.1

**What problem do you want to solve?**
Visual Studio Code use tasks.json that support comments in these forms:
```
// Comment

/*
Comment
*/
```

Example:
```
{
    // Comment

    "version": "2.0.0",
    "tasks": [
        {
            "label": "build"
        }
    ]
}
```

Could you please add an option to validate with comments?

**What do you think is the correct solution to problem?**
Add an option.

**Will you be able to implement it?**
No.