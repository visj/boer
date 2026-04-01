# [2017] Pattern regex error

By example:

```
createdAt: {
    type: 'string',
    pattern: '^\\d{4}\\-\\d{2}\\-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$'
},
```

And, the original value is: `createdAt: '2022-06-26T09:06:17.351Z'`, but says:

```
/.../node_modules/ajv/dist/core.js:23
const defaultRegExp = (str, flags) => new RegExp(str, flags);
                                      ^

SyntaxError: Invalid regular expression: /^\d{4}\-\d{2}\-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/: Invalid escape
    at new RegExp (<anonymous>)
```

But from node i can use same regex without errors:

```
whk@machine:/...$ node
Welcome to Node.js v16.14.2.
> new RegExp('^\\d{4}\\-\\d{2}\\-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$')
/^\d{4}\-\d{2}\-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
```

And, can not set a real pattern on `pattern` parameter, only can accept a string:

```
createdAt: {
    type: 'string',
    pattern: /^\d{4}\-\d{2}\-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
},
```

```
/.../node_modules/ajv/dist/core.js:266
                throw new Error(message);
                      ^

Error: schema is invalid: data/properties/createdAt/pattern must be string
```