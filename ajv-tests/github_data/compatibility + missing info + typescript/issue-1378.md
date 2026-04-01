# [1378] v7.0.3 throws TypeScript error when adding ajv-formats (works in v7.0.2)

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
I use `ajv@7.0.2` and it works with `ajv-formats@1.5.1`, but when I upgrade ajv to `7.0.3`, it breaks.

**Your typescript code**

```typescript
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const validator = new Ajv({
  allErrors: true,
});

addFormats(validator); // error is here

export default validator;
```

**Typescript compiler error messages**

```
Argument of type 'import("<project directory>/node_modules/ajv/dist/ajv").default' is not assignable to parameter of type 'import("<project directory>/node_modules/ajv-formats/node_modules/ajv/dist/core").default'.
  Types of property 'opts' are incompatible.
    Type 'import("<project directory>/node_modules/ajv/dist/core").InstanceOptions' is not assignable to type 'import("<project directory>/node_modules/ajv-formats/node_modules/ajv/dist/core").InstanceOptions'.
      Type 'InstanceOptions' is not assignable to type 'CurrentOptions'.
        Types of property 'keywords' are incompatible.
          Type 'import("<project directory>/node_modules/ajv/dist/types/index").Vocabulary | undefined' is not assignable to type 'import("<project directory>/node_modules/ajv-formats/node_modules/ajv/dist/types/index").Vocabulary | undefined'.
            Type 'import("<project directory>/node_modules/ajv/dist/types/index").Vocabulary' is not assignable to type 'import("<project directory>/node_modules/ajv-formats/node_modules/ajv/dist/types/index").Vocabulary'.
              Type 'string | import("<project directory>/node_modules/ajv/dist/types/index").CodeKeywordDefinition | import("<project directory>/node_modules/ajv/dist/types/index").FuncKeywordDefinition | import("<project directory>/node_modules/ajv/dist/types/index").MacroKeywordDefinition' is not assignable to type 'string | import("<project directory>/node_modules/ajv-formats/node_modules/ajv/dist/types/index").CodeKeywordDefinition | import("<project directory>/node_modules/ajv-formats/node_modules/ajv/dist/types/index").FuncKeywordDefinition | import("<project directory>/node_modules/aj...'.
                Type 'CodeKeywordDefinition' is not assignable to type 'string | CodeKeywordDefinition | FuncKeywordDefinition | MacroKeywordDefinition'.
                  Type 'import("<project directory>/node_modules/ajv/dist/types/index").CodeKeywordDefinition' is not assignable to type 'import("<project directory>/node_modules/ajv-formats/node_modules/ajv/dist/types/index").CodeKeywordDefinition'.
                    Types of property 'code' are incompatible.
                      Type '(cxt: import("<project directory>/node_modules/ajv/dist/compile/context").default, ruleType?: string | undefined) => void' is not assignable to type '(cxt: import("<project directory>/node_modules/ajv-formats/node_modules/ajv/dist/compile/context").default, ruleType?: string | undefined) => void'.
                        Types of parameters 'cxt' and 'cxt' are incompatible.
                          Type 'import("<project directory>/node_modules/ajv-formats/node_modules/ajv/dist/compile/context").default' is not assignable to type 'import("<project directory>/node_modules/ajv/dist/compile/context").default'.
                            The types of 'gen._scope' are incompatible between these types.
                              Type 'import("<project directory>/node_modules/ajv-formats/node_modules/ajv/dist/compile/codegen/scope").Scope' is not assignable to type 'import("<project directory>/node_modules/ajv/dist/compile/codegen/scope").Scope'.
                                Property '_names' is protected but type 'Scope' is not a class derived from 'Scope'.ts(2345)
```

**Describe the change that should be made to address the issue?**
Locally, I reverted back to `ajv@7.0.2`. Adding `// @ts-ignore` to the line before the error while using `7.0.3` works too. I don't know how to fix this otherwise.

**Are you going to resolve the issue?**
No, I don't know how and don't have time to dig into.