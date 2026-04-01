# [1344] standaloneCode fails to include all referenced methods

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
v7.0.0-rc.0

**Ajv options object**

```javascript
{
    $data: true,
    strict: false,
    loadSchema,
    code: {
      source: true,
    },
  }
```

**Your code**

I added the source code as a zip here. I tried to simplify the FHIR schema but I failed to reproduce the issue when I did so so sorry for that!
[reproduce_issue.zip](https://github.com/ajv-validator/ajv/files/5667617/reproduce_issue.zip)
You can find the source code in [this repl](https://repl.it/@Beretta1979/ReplicateAjvStandaloneCodeError) as well.

```javascript
const Ajv = require('ajv').default;
const standaloneCode = require('ajv/dist/standalone').default;
const jsonSchemaDraft06 = require('ajv/lib/refs/json-schema-draft-06.json');
const fs = require('fs');
const path = require('path');
const util = require('util');
const _replace = require('lodash/fp/replace');
const _flow = require('lodash/fp/flow');
const requireFromString = require('require-from-string');
const fhirQSchema = require('./fhir.questionnaire.schema.json');

const readFile = util.promisify(fs.readFile);
const getSchemaPath = _flow(
  _replace(
    'http://dummy.com',
    path.resolve(__dirname, './'),
  ),
);
const loadSchema = async (uri) => {
  const data = await readFile(getSchemaPath(uri), 'utf8');
  return JSON.parse(data);
};

const test = async () => {
  const ajv = new Ajv({
    $data: true,
    strict: false,
    loadSchema,
    code: {
      source: true,
      lines: true,
    },
  });

  ajv.addMetaSchema(jsonSchemaDraft06);
  const validate = await ajv.compileAsync(fhirQSchema);
  validate({});

  const moduleCode = standaloneCode(ajv, validate);
  const standaloneValidate = requireFromString(moduleCode);
  standaloneValidate({});
};


//this throws ReferenceError: validate23 is not defined
test().catch(e => console.error(e));
```

**What results did you expect?**
The standalone code generation to succeed. 
Instead requireFromString fails with error ReferenceError: validate23 is not defined.

Thank you for creating this great package and for helping me out!