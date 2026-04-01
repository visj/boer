# [813] typings bug: TypeScript typings are off for ajv.compile()

I am following the basic example in README:

```js
var Ajv = require('ajv');
var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
var validate = ajv.compile(schema);
var valid = validate(data);
```

I am seeing this error in my editor:

![screenshot from 2018-06-25 14-55-24](https://user-images.githubusercontent.com/11139560/41877907-dfcd0a7c-7887-11e8-9c90-4b71c46ff154.png)

