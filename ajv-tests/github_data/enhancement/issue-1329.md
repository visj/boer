# [1329] Feature or Assistance: Get compiled validation code

**What version of Ajv you are you using?** "ajv": "6.12.6"

**What problem do you want to solve?** Either documentation or a new method to easily get a single compiled validation method as text

**What do you think is the correct solution to problem?** Better documentation, a new method to get compiled source-code, or answer that 7 beta has this working

**Will you be able to implement it?** I see the method when stepping into node_modules/ajv. But I haven't been able to pin-point why source code is a wrapper around the validation function I wish to see

`npm install quicktype-core json-schema-to-openapi-schema avj && node index.js`

```
// Typescript index.js, Goal is to infer schema from data and generate appropriate compiled validation
//    Feeds documentation, used in Azure Trigger which cannot include external dependencies,
//    feeds application validation, samples existing endpoint data and gives UI dev-tooling for validation, etc...

import {
    quicktype,
    InputData,
    jsonInputForTargetLanguage
} from "quicktype-core";

import * as toOpenApi from 'json-schema-to-openapi-schema';
import * as Ajv from 'ajv';

async function quicktypeJSONSchema(jsonSchemaStrings: string[], typeName, targetLanguage = 'JSON Schema') {
    const schemaInput = jsonInputForTargetLanguage(targetLanguage);
  
    // We could add multiple schemas for multiple types,
    // but here we're just making one type from JSON schema.
    await schemaInput.addSource({ name: typeName, samples: jsonSchemaStrings });
  
    const inputData = new InputData();
    inputData.addInput(schemaInput);
  
    const result = await quicktype({
      inputData,
      lang: targetLanguage,
    });

    if (targetLanguage === 'JSON Schema') {
        return JSON.parse(result.lines.reduce((str, line) => str + line, ''));
    }

    return result.lines.reduce((str, line) => str + line + "\r\n", '');
}

const samples = [{
  "id": 28,
  "Title": "Sweden",
  "test" {
    "a": 1,
    "option_a": "a"
  },
  "required": "yes"
}, {
  "id": 56,
  "Title": "USA",
  "Optional": 5,
  "test" {
    "a": 2,
    "option_b": "b"
  },
  "required": "ok"
}, {
  "id": 89,
  "Title": "England",
  "test" {
    "a": 3,
    "option_c": "c"
  },
  "required": "nice"
}];

const generateSchema = async function(data): Promise<any> {
    let responseMessage = [];
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));
    ajv.addFormat('integer', new RegExp('(?<=\s|^)\d+(?=\s|$)'));

    try {
        const jsonSchema = data; // Code this is based on grabs data from database
        const openApi = toOpenApi(jsonSchema);
        const typescriptSchemaCode = await quicktypeJSONSchema(resources.map(doc => JSON.stringify(doc)), collection, 'TypeScript');
        const csharpSchemaCode = await quicktypeJSONSchema(resources.map(doc => JSON.stringify(doc)), collection, 'C#');

        ajv._opts.allErrors = false; // This collects all errors instead of failing validation fast and returning only the first error

        // WARNING: validationCode is incorrect...but it is obtainable. Out of time for this spike!
        // TODO: Get the real source code for validation by stepping into avj.compile...refVal should not be needed!!! Unexpected source code is returned
        ajv._opts.sourceCode = true; // Our purpose is to get the source code
        const code = ajv.compile(jsonSchema).source['code'] || 'validate = function(data) { if (data) { this.errors = [{ errorMessage: "data should not be defined" }]; return false; } return true; }';
        const validationCode = '(data) => { const refVal = []; ' + code.split('return validate;').join('') + '  const isValid = validate(data); return { isValid, errors: validate.errors }; }';

        // TODO: Why is validationCode showing this? (v + '') inside the call-stack shows source-code correctly

        responseMessage.push({ jsonSchema, openApi, typescriptSchemaCode, csharpSchemaCode, validationCode });
    } catch(ex) {
        console.log(`bad resource ${data} not found`, ex);
    }

    return responseMessage;
};

console.log(generateSchema(samples));
```
