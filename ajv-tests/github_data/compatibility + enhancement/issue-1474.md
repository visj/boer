# [1474] Make pattern match with Unicode flag opt-in via options.

**The version of Ajv you are using**
7.x

**The environment you have the problem with**
IE11 -- no support for Unicode flag in Regular Expressions

References:
https://kangax.github.io/compat-table/es6/#test-RegExp_y_and_u_flags
https://stackoverflow.com/questions/46735209/internet-explorer-11-syntax-error-in-regular-expression-error-with-javascript-re

**Your code (please make it as small as possible to reproduce the issue)**

A schema that validates a string with a pattern where the RegExp pattern uses Unicode-incompatible characters.

For example: If I try to match non-English characters:
```json
{
  "type": "string",
  "pattern": "^[a-zA-Z0-9!@#$%^&*()_ +\-=\[\]{};:\"|,<>\/?`~\'.\\]*$"
}
```

**If your issue is in the browser, please list the other packages loaded in the page in the order they are loaded. Please check if the issue gets resolved (or results change) if you move Ajv bundle closer to the top**

**Results and error messages in your platform**

```js
// works fine
new RegExp("^[a-zA-Z0-9!@#$%^&*()_ +\-=\[\]{};:\"|,<>\/?`~\'.\\]*$")

// throws an error
new RegExp("^[a-zA-Z0-9!@#$%^&*()_ +\-=\[\]{};:\"|,<>\/?`~\'.\\]*$", "u")
> Uncaught SyntaxError: Invalid regular expression: ...: Incomplete quantifier
```

An option to skip the Unicode flag in this function should do the trick.
Alternatively, the flag should not be used if "code: es5" is given in AJV options.'