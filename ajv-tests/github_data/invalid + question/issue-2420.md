# [2420] How can I access `definitions` in schema-store using `$ref`?

## Motivation

When developing a RESTful server using Express.js, Fastify.js, etc. in a Node environment, it uses json-schema to validate API request inputs. If you're using json-schema to validate request inputs, integrating multiple schemas can be more manageable as the number of APIs grows.

```ts
interface IPeople {
  firstName: string;
  lastName: string;
}

interface IStudent extends IPeople {
  major: string;
}

interface IProfessor extends IPeople {
  room: number;
}
```

The example above is in typescript, but it can also be expressed in json-schema.

```json
{
  "$id": "IPeople",
  "properties": {
    "firstName": {
      "type": "string"
    },
    "lastName": {
      "type": "string"
    }
  },
}
```

```json
{
  "$id": "IStudent",
  "properties": {
    "major": {
      "type": "string"
    },
    "$ref": "IPeople"
  },
}
```


```json
{
  "$id": "IProfessor",
  "properties": {
    "room": {
      "type": "number"
    },
    "$ref": "IPeople"
  },
}
```

It's useful to have a structured schema like this.

## Problem

I'm looking for an way to configure a schema registry per API in one json-schema store. For example, I'm looking for a way to access the contents inside `definitions` in two schema stores, `https://json.schemastore.org/eslintrc.json` and `https://json.schemastore.org/partial-eslint-plugins.json`.

```js
import Ajv from 'ajv';

const ajv = new Ajv();

const [reply01, reply02] = await Promise.all([
  fetch('https://json.schemastore.org/eslintrc.json', { method: 'GET' }),
  fetch('https://json.schemastore.org/partial-eslint-plugins.json', {
    method: 'GET',
  }),
]);

const [resp01, resp02] = await Promise.all([reply01.json(), reply02.json()]);

ajv.addSchema(resp02);
ajv.addSchema(resp01);

const refs = [
  'https://json.schemastore.org/eslintrc.json/definitions/stringOrStringArray',
  'https://json.schemastore.org/eslintrc.json/#/definitions/stringOrStringArray',
  'https://json.schemastore.org/eslintrc.json#/definitions/stringOrStringArray',
  '#/definitions/stringOrStringArray',
  'https://json.schemastore.org/partial-eslint-plugins.json/definitions/ruleNumber',  
  'https://json.schemastore.org/partial-eslint-plugins.json#/definitions/ruleNumber',  
  'https://json.schemastore.org/partial-eslint-plugins.json/ruleNumber',  
]

const validators = refs.map((ref) => {
  try {
    const validator = ajv.compile({ $ref: ref, });
    return validator
  } catch (error) {
    console.log(error);
    return undefined;
  }
});
```

## Expectation

How do I access the above `eslintrc.json/definitions`?

## Environments

1. Node v20.11.1
2. AJV 8.12.0
3. Reproducable Repo.
   1. https://github.com/imjuni/json-schema-ref-test.git