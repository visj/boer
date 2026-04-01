# [2516] bug in AJV custom keyword validator

https://ajv.js.org/keywords.html#define-keyword-with-code-generation-function

In the very first example of the above:

```
import {_, KeywordCxt} from Ajv

ajv.addKeyword({
  keyword: "even",
  type: "number",
  schemaType: "boolean",
  // $data: true // to support [$data reference](./guide/combining-schemas.md#data-reference), ...
  code(cxt: KeywordCxt) {
    const {data, schema} = cxt
    const op = schema ? _`!==` : _`===`
    cxt.fail(_`${data} %2 ${op} 0`) // ... the only code change needed is to use `cxt.fail$data` here
  },
})

const schema = {even: true}
const validate = ajv.compile(schema)
console.log(validate(2)) // true
console.log(validate(3)) // false
```

This also returns true:

```
console.log(validate({})) // true
```

Here is the compiled validator code:


```
"use strict";
module.exports = validate16;
module.exports.default = validate16;
const schema34 = { even: true };
function validate16(
  data,
  { instancePath = "", parentData, parentDataProperty, rootData = data } = {}
) {
  let vErrors = null;
  let errors = 0;
  if (typeof data == "number" && isFinite(data)) {
    if (data % 2 !== 0) {
      const err0 = {
        instancePath,
        schemaPath: "#/even",
        keyword: "even",
        params: {},
        message: 'must pass "even" keyword validation',
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
  }
  validate16.errors = vErrors;
  return errors === 0;
}
```

The bug is caused by the fact that there is no `else` statement to handle the `if (typeof data == "number" && isFinite(data))`.

So when the `if (typeof data == "number" && isFinite(data))` fails, the validator just returns without any errors, when in fact there should be an error.

I am using `"ajv": "^8.11.0"`.

I believe that this is a bug.