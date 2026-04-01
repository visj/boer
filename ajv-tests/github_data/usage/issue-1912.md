# [1912] minLength/maxLength not validated

Hi,
I could not get minLength/maxLength to work correctly and as I understood from the documentation. Maybe it's me or maybe this is not clearly specified.

In the snippet code run below (node 14 env), I expect to get a "false" response (as the length of the string is 6 and it is expected to be less than 3) yet I get "true". There are no errors in running this code.

```
const Ajv = require("ajv")
const ajv = new Ajv()

let compiledSchema = ajv.compile({
    type: "object",
    properties: {
        name: {
            type: "string",
            maxLength: 3
        }
    }
})

let a = compiledSchema({nume: "Lucian"})
console.log(a)
```