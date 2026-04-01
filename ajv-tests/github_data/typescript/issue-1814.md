# [1814] Error TS4023: Exported variable has or is using name 'NumberKeywords' from external module node_modules/ajv/dist/types/json-schema but cannot be named.

I built a library to wrap Ajv features but I don't reach to build it because of the `Error TS4023: Exported variable has or is using name 'NumberKeywords' from external module node_modules/ajv/dist/types/json-schema but cannot be named.`.

I made a reproducible example available [here](https://gitlab.com/hadrien-toma/ajv-issue).

Basically I would like to have this library building:

![image](https://user-images.githubusercontent.com/6162030/141443353-e185d1df-f065-4612-9b8c-b5b1a17eaf80.png)

Here are the commands I used to build this repository:

```
npx create-nx-workspace@latest workspace --preset=empty --cli=nx --interactive=false --nx-cloud=false --packageManager=yarn --skipGit

cd workspace

yarn add \
	ajv \
	ajv-formats

yarn add --dev \
	@angular/cli \
	@nrwl/node \
    json

node_modules/.bin/json --in-place -f package.json -e "this.scripts['json'] = 'json';"
yarn run json --in-place -f package.json -e "this.scripts['nx'] = 'nx';"

yarn run nx generate @nrwl/node:library --directory=json-schemas --name=ajv --buildable --publishable --strict --importPath="@workspace/json-schemas-ajv" --standaloneConfig

yarn run json --in-place -f tsconfig.base.json -e "this.angularCompilerOptions = {};"
yarn run json --in-place -f tsconfig.base.json -e "this.angularCompilerOptions.fullTemplateTypeCheck = true;"
yarn run json --in-place -f tsconfig.base.json -e "this.angularCompilerOptions.strictTemplates = true;"
yarn run json --in-place -f tsconfig.base.json -e "this.angularCompilerOptions.trace = true;"

yarn run json --in-place -f tsconfig.base.json -e "this.compilerOptions['allowSyntheticDefaultImports'] = true;"
yarn run json --in-place -f tsconfig.base.json -e "this.compilerOptions['alwaysStrict'] = true;"
yarn run json --in-place -f tsconfig.base.json -e "this.compilerOptions['esModuleInterop'] = true;"
yarn run json --in-place -f tsconfig.base.json -e "this.compilerOptions['forceConsistentCasingInFileNames'] = true;"
yarn run json --in-place -f tsconfig.base.json -e "this.compilerOptions['noImplicitAny'] = true;"
yarn run json --in-place -f tsconfig.base.json -e "this.compilerOptions['noImplicitReturns'] = true;"
yarn run json --in-place -f tsconfig.base.json -e "this.compilerOptions['noUnusedLocals'] = true;"
yarn run json --in-place -f tsconfig.base.json -e "this.compilerOptions['noUnusedParameters'] = true;"
yarn run json --in-place -f tsconfig.base.json -e "this.compilerOptions['resolveJsonModule'] = true;"
yarn run json --in-place -f tsconfig.base.json -e "this.compilerOptions['strict'] = true;"
yarn run json --in-place -f tsconfig.base.json -e "this.compilerOptions['strictNullChecks'] = true;"
yarn run json --in-place -f tsconfig.base.json -e "this.compilerOptions['stripInternal'] = true;"

# Adapt workspace/libs/json-schemas/ajv/src/lib to create an isValid map for Ajv validators.
```

- Here is the content of the `workspace/libs/json-schemas/ajv/src/lib/is-valid/json-schemas-ajv-is-valid.ts` file:

```ts
// workspace/libs/json-schemas/ajv/src/lib/is-valid/json-schemas-ajv-is-valid.ts

import Ajv, { JSONSchemaType, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { jsonSchemasAjvKeywordsEven } from '../keywords/even/json-schemas-ajv-keywords-even';

export interface TsJsonSchemasError<T> {
	instancePath: string;
	keyword: string;
	message: string;
	params: { limit?: number } & T;
	schemaPath: string;
}

export let jsonSchemasAjvInstance = new Ajv({ allErrors: true });

jsonSchemasAjvInstance = addFormats(jsonSchemasAjvInstance);

jsonSchemasAjvInstance = jsonSchemasAjvKeywordsEven({ ajv: jsonSchemasAjvInstance });

export const tsJsonSchemasMap = new Map<unknown, unknown>();

export const jsonSchemasAjvIsValid = <S, D>({ schema, value }: { schema: JSONSchemaType<S>; value: D }) => {
	const isSchemaInSet = (<Map<Record<string, unknown>, ValidateFunction<S>>>tsJsonSchemasMap).has(schema);
	if (!isSchemaInSet) {
		(<Map<Record<string, unknown>, ValidateFunction<S>>>tsJsonSchemasMap).set(schema, jsonSchemasAjvInstance.compile(schema));
	}
	const validateFunction = <ValidateFunction<S>>(<Map<Record<string, unknown>, ValidateFunction<S>>>tsJsonSchemasMap).get(schema);
	const isValid = (<Map<Record<string, unknown>, ValidateFunction<S>>>tsJsonSchemasMap).has(schema) ? validateFunction(value) : false;
	const errorArray = validateFunction.errors?.map((error) => ({ ...error, message: error.message ?? '' })) ?? [];
	return { isValid, errorArray };
};
 ```

The command to build the library and its output:

```bash

cd workspace
yarn run nx run json-schemas-ajv:build

# Gives the following error:

# 21 export const jsonSchemasAjvIsValid = <S, D>({ schema, value }: { schema: JSONSchemaType<S>; value: D }) => {
#                ~~~~~~~~~~~~~~~~~~~~~
# libs/json-schemas/ajv/src/lib/is-valid/json-schemas-ajv-is-valid.ts:21:14 - error TS4023: Exported variable 'jsonSchemasAjvIsValid' has or is using name 'NumberKeywords' from external module "/home/hadrien_toma/gitlab.com/hadrien-toma/ajv-issue/workspace/node_modules/ajv/dist/types/json-schema" but cannot be named.
```

Notes:

- It is likely to be linked to troubles in https://github.com/ajv-validator/ajv/issues/1695

### Environment

```
> yarn run nx report
$ nx report

>  NX  Report complete - copy this into the issue template

  Node : 14.18.1
  OS   : linux x64
  yarn : 1.22.15
  
  nx : 13.1.4
  @nrwl/angular : Not Found
  @nrwl/cli : 13.1.4
  @nrwl/cypress : Not Found
  @nrwl/devkit : 13.1.4
  @nrwl/eslint-plugin-nx : 13.1.4
  @nrwl/express : Not Found
  @nrwl/jest : 13.1.4
  @nrwl/linter : 13.1.4
  @nrwl/nest : Not Found
  @nrwl/next : Not Found
  @nrwl/node : 13.1.4
  @nrwl/nx-cloud : Not Found
  @nrwl/react : Not Found
  @nrwl/schematics : Not Found
  @nrwl/tao : 13.1.4
  @nrwl/web : Not Found
  @nrwl/workspace : 13.1.4
  @nrwl/storybook : Not Found
  @nrwl/gatsby : Not Found
  typescript : 4.3.5

Done in 1.89s.
```