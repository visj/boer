# [1926] Can't import ValidationError type

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html

This template is for issues about missing or incorrect type definition and other typescript-related issues.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?** 8.10.0

**Your typescript code**

<!--
Please make it as small as possible to reproduce the issue
-->

Both snippets below fail:

```typescript
import Ajv, {
    AnySchema,
    AsyncValidateFunction,
    ErrorObject,
    JSONSchemaType,
    KeywordDefinition,
    Options,
    ValidateFunction,
} from 'ajv';

const error: Ajv.ValidationError = ... // 'Ajv' only refers to a type, but is being used as a namespace here

```

```typescript
import Ajv, {
    AnySchema,
    AsyncValidateFunction,
    ErrorObject,
    JSONSchemaType,
    KeywordDefinition,
    Options,
    ValidateFunction,
    ValidationError,   // <----------- module ajv has no exported member ValidationError
} from 'ajv';
```

**Typescript compiler error messages**

see inline above. As additional context, here are my Typescript compiler options:

```
{
    "compilerOptions": {
        "declaration": true,
        "emitDecoratorMetadata": true,
        "esModuleInterop": true,
        "experimentalDecorators": true,
        "forceConsistentCasingInFileNames": true,
        "importHelpers": true,
        "lib": [
            "es2018"
        ],
        "module": "commonjs",
        "moduleResolution": "node",
        "noEmitOnError": true,
        "noImplicitAny": true,
        "removeComments": true,
        "skipLibCheck": true,
        "sourceMap": true,
        "strict": true,
        "target": "es2017"
    }
}
```

**Describe the change that should be made to address the issue?** Export ValidationError at the top level along with other ajv types

**Are you going to resolve the issue?** If this is confirmed as an issue sure, I can try. But I just wanted to validate first that it's not me doing something wrong.
