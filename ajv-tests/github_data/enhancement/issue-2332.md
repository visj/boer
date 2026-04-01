# [2332] Detailed `pattern` violation errors

**What version of Ajv you are you using?**

`8.12.0`

**What problem do you want to solve?**

More explicit error details when using `pattern` on `string` properties.

Current behaviour:

```javascript
# test.js
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

import schema from './schema.json' assert { type: 'json' };
import data from './data.json' assert { type: 'json' };

const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const validate = ajv.compile(schema);
const result = validate(data);

if (!result) {
  console.error(validate.errors);
  process.exit(1)
}
```

```json
{
  "$id": "my-schema",
  "$schema": "http://json-schema.org/schema",

  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "pattern": "^f.*z$"
    }
  }
}
```

```json
{
  "name": "oobarba"
}
```

```shell
$ node test.js
[
  {
    instancePath: '/name',
    schemaPath: '#/properties/name/pattern',
    keyword: 'pattern',
    params: { pattern: '^f.*z$' },
    message: 'must match pattern "^f.*z$"'
  }
]
```

**What do you think is the correct solution to problem?**

It would be nice to show the location in the string where the pattern is violated.

I couldn't find any JS API that would return errors when matching a string from a regex.
However, it seems that negating (not sure if that's generalizable) a given regex could do the trick:

```javascript
const regexContent = "f.*z"

const regex = new RegExp(`^${regexContent}$`);
console.log("foobarbaz".match(regex));
console.log("oobarba".match(regex));

const invertedRegex = new RegExp(`^(?!.*${regexContent})`);
console.log("foobarbaz".match(invertedRegex));
console.log("oobarba".match(invertedRegex));
```

```shell
$ node test.js 
[ 'foobarbaz', index: 0, input: 'foobarbaz', groups: undefined ]
null
null
[ '', index: 0, input: 'oobarba', groups: undefined ]
```