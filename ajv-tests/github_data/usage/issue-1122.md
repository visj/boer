# [1122] Recursive definitions are not OK? In the README.md of ajv it said "References can be recursive""

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
ajv@6.10.2 


**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
{ allErrors: true, schemaId: 'auto', logger: false, useDefaults: true, passContext: true }

```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

http://json-schema.org/draft-04/schema#   or     http://json-schema.org/draft-07/schema#


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```yml

components:
  schemas:
    ISO8583Message:
      type: object
      additionalProperties: false
      required:
        - messageId
        - elements
      description: Message data that is being processed
      properties:
        messageId:
          type: string
          minLength: 1
        elements:
          type: array
          items:
            $ref: '#/components/schemas/DataElement'

    SubMessage:
      type: object
      additionalProperties: false
      required:
        - elementId
        - elements
      properties:
        elementId:
          type: string
          minLength: 1
        elements:
          type: array
          items:
            $ref: '#/components/schemas/DataElement'

    DataElement:
      oneOf:
        - $ref: '#/components/schemas/SimpleDataElement'
        - $ref: '#/components/schemas/SubMessage'

    SimpleDataElement:
      required:
        - elementId
        - value
      properties:
        elementId:
          type: string
          minLength: 1
        value:
          type: string
          minLength: 1
```
my code:
```
import Ajv from 'ajv';
/* tslint:disable-next-line:no-submodule-imports */
import * as draft4 from 'ajv/lib/refs/json-schema-draft-04.json';

const ajv = new Ajv({ allErrors: true, schemaId: 'id', logger: false, useDefaults: true });
ajv.addMetaSchema(draft4);


const compiledSchemaOfDocument = ajv.compile(schemaOfDocument);

export async function load(inputParam) {
  log('Loading document...');
  log('Resolving document references...');
  const input = await refParser.dereference(inputParam);
  log('Validating document against JSON-Schema...');
  const valid = compiledSchemaOfDocument(input);  // HERE
  if (!valid) {
    log('Document is not valid.');
    throw errorWrapper({ errors: compiledSchemaOfDocument.errors });
  }
  log('Finished validating document.');
  return input as VerifiedDocument;
}
```

**Validation result, data AFTER validation, error messages**

```
RangeError: Maximum call stack size exceeded
    at validate (eval at localCompile (/Users/jesselee/WebstormProjects/star/node_modules/ajv/lib/compile/index.js:120:26), <anonymous>:3:47577)
    at validate (eval at localCompile (/Users/jesselee/WebstormProjects/star/node_modules/ajv/lib/compile/index.js:120:26), <anonymous>:3:33226)
    at validate (eval at localCompile (/Users/jesselee/WebstormProjects/star/node_modules/ajv/lib/compile/index.js:120:26), <anonymous>:3:29910)
    at validate (eval at localCompile (/Users/jesselee/WebstormProjects/star/node_modules/ajv/lib/compile/index.js:120:26), <anonymous>:3:20250)
    at validate (eval at localCompile (/Users/jesselee/WebstormProjects/star/node_modules/ajv/lib/compile/index.js:120:26), <anonymous>:3:26862)
    at validate (eval at localCompile (/Users/jesselee/WebstormProjects/star/node_modules/ajv/lib/compile/index.js:120:26), <anonymous>:3:29910)
    at validate (eval at localCompile (/Users/jesselee/WebstormProjects/star/node_modules/ajv/lib/compile/index.js:120:26), <anonymous>:3:20250)
    at validate (eval at localCompile (/Users/jesselee/WebstormProjects/star/node_modules/ajv/lib/compile/index.js:120:26), <anonymous>:3:26862)
    at validate (eval at localCompile (/Users/jesselee/WebstormProjects/star/node_modules/ajv/lib/compile/index.js:120:26), <anonymous>:3:29910)
    at validate (eval at localCompile (/Users/jesselee/WebstormProjects/star/node_modules/ajv/lib/compile/index.js:120:26), <anonymous>:3:20250)


```

**What results did you expect?**
compilation

**Are you going to resolve the issue?**
if you want? 