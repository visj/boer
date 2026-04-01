# [1449] v7.1.x breaks usage with ajv-formats and Typescript

This error happens when upgrading from `7.0.4` to `7.1.0` or `7.1.1`.
I'm on the latest `ajv-formats`.

This is how I initialize ajv:
```typescript
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

let ajv = new Ajv({ verbose: true, allowMatchingProperties: true });
addFormats(ajv);
```

![image](https://user-images.githubusercontent.com/1297448/108185301-7156eb00-710c-11eb-82a4-92d06f6a7a21.png)


This is my ts config:
```
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "es2020",
    "strict": true,
    "sourceMap": true,
    "outDir": "dist",
    "moduleResolution": "node", // Needed for npm modules that use commonjs
    "allowSyntheticDefaultImports": true, // So we can import default value from node_modules https://stackoverflow.com/a/54302557/1426570
    "resolveJsonModule": true,
    "declaration": true
  },
  "include": ["src/**/*"]
}
```

The TS error that I get:

```
$ tsc
src/utils/validateSchema.ts:6:14 - error TS2345: Argument of type 'import("/Users/urigoldshtein/Code/newScraper/node_modules/ajv/dist/ajv").default' is not assignable to parameter of type 'import("/Users/urigoldshtein/Code/newScraper/node_modules/ajv-formats/node_modules/ajv/dist/core").default'.
  Types of property 'opts' are incompatible.
    Type 'import("/Users/urigoldshtein/Code/newScraper/node_modules/ajv/dist/core").InstanceOptions' is not assignable to type 'import("/Users/urigoldshtein/Code/newScraper/node_modules/ajv-formats/node_modules/ajv/dist/core").InstanceOptions'.
      Type 'InstanceOptions' is not assignable to type 'CurrentOptions'.
        Types of property 'keywords' are incompatible.
          Type 'import("/Users/urigoldshtein/Code/newScraper/node_modules/ajv/dist/types/index").Vocabulary | undefined' is not assignable to type 'import("/Users/urigoldshtein/Code/newScraper/node_modules/ajv-formats/node_modules/ajv/dist/types/index").Vocabulary | undefined'.
            Type 'import("/Users/urigoldshtein/Code/newScraper/node_modules/ajv/dist/types/index").Vocabulary' is not assignable to type 'import("/Users/urigoldshtein/Code/newScraper/node_modules/ajv-formats/node_modules/ajv/dist/types/index").Vocabulary'.
              Type 'string | import("/Users/urigoldshtein/Code/newScraper/node_modules/ajv/dist/types/index").CodeKeywordDefinition | import("/Users/urigoldshtein/Code/newScraper/node_modules/ajv/dist/types/index").FuncKeywordDefinition | import("/Users/urigoldshtein/Code/newScraper/node_modules/ajv/dist/types/index").MacroKeywordDefin...' is not assignable to type 'string | import("/Users/urigoldshtein/Code/newScraper/node_modules/ajv-formats/node_modules/ajv/dist/types/index").CodeKeywordDefinition | import("/Users/urigoldshtein/Code/newScraper/node_modules/ajv-formats/node_modules/ajv/dist/types/index").FuncKeywordDefinition | import("/Users/urigoldshtein/Code/newScraper/nod...'.
                Type 'CodeKeywordDefinition' is not assignable to type 'string | CodeKeywordDefinition | FuncKeywordDefinition | MacroKeywordDefinition'.
                  Type 'import("/Users/urigoldshtein/Code/newScraper/node_modules/ajv/dist/types/index").CodeKeywordDefinition' is not assignable to type 'import("/Users/urigoldshtein/Code/newScraper/node_modules/ajv-formats/node_modules/ajv/dist/types/index").CodeKeywordDefinition'.
                    Types of property 'code' are incompatible.
                      Type '(cxt: import("/Users/urigoldshtein/Code/newScraper/node_modules/ajv/dist/compile/context").default, ruleType?: string | undefined) => void' is not assignable to type '(cxt: import("/Users/urigoldshtein/Code/newScraper/node_modules/ajv-formats/node_modules/ajv/dist/compile/context").default, ruleType?: string | undefined) => void'.
                        Types of parameters 'cxt' and 'cxt' are incompatible.
                          Type 'import("/Users/urigoldshtein/Code/newScraper/node_modules/ajv-formats/node_modules/ajv/dist/compile/context").default' is not assignable to type 'import("/Users/urigoldshtein/Code/newScraper/node_modules/ajv/dist/compile/context").default'.
                            The types of 'gen._scope' are incompatible between these types.
                              Type 'import("/Users/urigoldshtein/Code/newScraper/node_modules/ajv-formats/node_modules/ajv/dist/compile/codegen/scope").Scope' is not assignable to type 'import("/Users/urigoldshtein/Code/newScraper/node_modules/ajv/dist/compile/codegen/scope").Scope'.
                                Property '_names' is protected but type 'Scope' is not a class derived from 'Scope'.

6   addFormats(ajv);
               ~~~


Found 1 error.
```

Let me know if you need me to add more info and thank you so much for such a wonderful library!
