# [2003] Support OpenAPI 3.0 `discriminator.mapping`

**What version of Ajv you are you using?**

8.11.0

**What problem do you want to solve?**

I'd like to validate JSON schema extracted from OpenAPI 3.0 that includes `discriminator.mapping`. Currently having it will make AJV throw a unavoidable `discriminator: mapping is not supported` error. Example code that throws:

```js
import Ajv from "ajv";

const schema = {
  type: "object",
  properties: {
    type: {
      type: "string"
    },
    value: {
      oneOf: [
        {type: "string"},
        {type: "number"},
      ],
      discriminator: {
        propertyName: "type",
        mapping: {
          string: {type: "string"},
          number: {type: "number"},
        },
      },
    },
  },
};

const ajv = new Ajv({discriminator: true});
const validate = ajv.compile(schema); // Error: discriminator: mapping is not supported
console.info(validate({type: "string", value: "foo"}));
```

**What do you think is the correct solution to problem?**

Either implement `discriminator.mapping` [as described here](https://swagger.io/specification/#discriminator-object) or alternatively gracefully ignore the presence of it so user code can implement this feature itself.

**Will you be able to implement it?**

I could probably make it gracefully ignore the property.