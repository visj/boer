# [2426] ajv 8.13.0 upgrade doesn't work with ajv-formats 3.0.1 with TypeScript

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.13.0

With 8.12.0 the following TypeScript code works:

```
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
const ajv = new Ajv();
addFormats(ajv, ['date-time']);
```

Upgrading ajv to 8.13.0 I get this compile error:

```
src/a.ts(4,12): error TS2379: Argument of type 'import("foobar/node_modules/ajv/dist/ajv").Ajv' is not assignable to parameter of type 'import("foobar/node_modules/ajv-formats/node_modules/ajv/dist/core").default' with 'exactOptionalPropertyTypes: true'. Consider adding 'undefined' to the types of the target's properties.
  Types of property 'opts' are incompatible.
    Type 'import("foobar/node_modules/ajv/dist/core").InstanceOptions' is not assignable to type 'import("foobar/node_modules/ajv-formats/node_modules/ajv/dist/core").InstanceOptions' with 'exactOptionalPropertyTypes: true'. Consider adding 'undefined' to the types of the target's properties.
      Type 'InstanceOptions' is not assignable to type 'CurrentOptions' with 'exactOptionalPropertyTypes: true'. Consider adding 'undefined' to the types of the target's properties.
        Types of property 'keywords' are incompatible.
          Type 'import("foobar/node_modules/ajv/dist/types/index").Vocabulary' is not assignable to type 'import("foobar/node_modules/ajv-formats/node_modules/ajv/dist/types/index").Vocabulary'.
            Type 'string | import("foobar/node_modules/ajv/dist/types/index").KeywordDefinition' is not assignable to type 'string | import("foobar/node_modules/ajv-formats/node_modules/ajv/dist/types/index").KeywordDefinition'.
              Type 'CodeKeywordDefinition' is not assignable to type 'string | KeywordDefinition'.
                Type 'import("foobar/node_modules/ajv/dist/types/index").CodeKeywordDefinition' is not assignable to type 'import("foobar/node_modules/ajv-formats/node_modules/ajv/dist/types/index").CodeKeywordDefinition' with 'exactOptionalPropertyTypes: true'. Consider adding 'undefined' to the types of the target's properties.
                  Types of property 'code' are incompatible.
                    Type '(cxt: import("foobar/node_modules/ajv/dist/compile/validate/index").KeywordCxt, ruleType?: string | undefined) => void' is not assignable to type '(cxt: import("foobar/node_modules/ajv-formats/node_modules/ajv/dist/compile/validate/index").KeywordCxt, ruleType?: string | undefined) => void'.
                      Types of parameters 'cxt' and 'cxt' are incompatible.
                        Type 'import("foobar/node_modules/ajv-formats/node_modules/ajv/dist/compile/validate/index").KeywordCxt' is not assignable to type 'import("foobar/node_modules/ajv/dist/compile/validate/index").KeywordCxt' with 'exactOptionalPropertyTypes: true'. Consider adding 'undefined' to the types of the target's properties.
                          The types of 'gen._scope' are incompatible between these types.
                            Type 'import("foobar/node_modules/ajv-formats/node_modules/ajv/dist/compile/codegen/scope").Scope' is not assignable to type 'import("foobar/node_modules/ajv/dist/compile/codegen/scope").Scope' with 'exactOptionalPropertyTypes: true'. Consider adding 'undefined' to the types of the target's properties.
                              Property '_names' is protected but type 'Scope' is not a class derived from 'Scope'.
```

My `package.json` has this

```
  "dependencies": {
    "@types/node": "*",
    "ajv": "8.13.0",
    "ajv-formats": "3.0.1"
  }
```