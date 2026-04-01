# [2204]  This expression is not constructable, Type 'typeof import (filepath)has no construct signatures.       

Hi all, I am pretty new with using AJV with Typescript. I am trying to import the Ajv module from ajv as such:

`import Ajv from "ajv;`

And, use it as I used to do it in plain JavaScript. 
`
const ajv = new Ajv({ allErrors: true });`

However, I am getting an error from the ts compiler as such:

```
error TS2351: This expression is not constructable.
  Type 'typeof import("/Users/username/Documents/node_modules/ajv/dist/ajv")' has no construct signatures.

 const ajv = new Ajv({ allErrors: true });
```
 
 Is there anything that I am doing wrong during the import process?
 



 My TS config file is as below:
 
```
 `{
  "compilerOptions": {
    /* Visit https://aka.ms/tsconfig to read more about this file */

    /* Projects */

    /* Language and Environment */
    "target": "ES6",                                  /* Set the JavaScript language version for emitted JavaScript and include compatible library declarations. */

    /* Modules */
    "module": "Node16",                                /* Specify what module code is generated. */
    "moduleResolution": "Node16",                          /* Specify how TypeScript looks up a file from a given module specifier. */

    /* JavaScript Support */

    /* Emit */
    "outDir": "./dist",                                  /* Specify an output folder for all emitted files. */

    /* Interop Constraints */
    "esModuleInterop": true,                             /* Emit additional JavaScript to ease support for importing CommonJS modules. This enables 'allowSyntheticDefaultImports' for type compatibility. */
    "forceConsistentCasingInFileNames": true,            /* Ensure that casing is correct in imports. */

    /* Type Checking */
    "strict": true,                                      /* Enable all strict type-checking options. */

    /* Completeness */
    // "skipDefaultLibCheck": true,                      /* Skip type checking .d.ts files that are included with TypeScript. */
    "skipLibCheck": true,                                 /* Skip type checking all .d.ts files. */

    "sourceMap": true,
    "rootDir": "src",
    "declaration": true,
    "types": ["node", "mocha"]
  },
  "include": ["src/**/*", ".env"],
  "exclude": ["dist/**/*", "node_modules", "test/**/*"]
}
` 
 

```

Help would be appreciated. Thanks 