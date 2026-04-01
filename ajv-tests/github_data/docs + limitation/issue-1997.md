# [1997] [JTD] unions do not work with ajv.compileParser

**What version of Ajv are you using?**
8.11.0 with JTD

**Issue description**
I created a simple JTD schema using the `union` keyword.

When I use it with Validate Function created with `ajv.compile` everything seems to work correctly (in my example `field` accepts `string` and `boolean`).

Unfortunately, when I use it with `ajv.compileParser` instance `union` metadata seems to be omitted and invalid data is parsed without errors.

![image](https://user-images.githubusercontent.com/59613573/171865552-d3331765-b75c-4870-bfa4-8b85c58451c9.png)


**What results did you expect?**
I expected that using `ajv.compile` and `ajv.compileParser` with the same schema will validate data in the same way.

**Are you going to resolve the issue?**
For now, I decided to firstly parse the string with a parser created with `ajv.compileParser` and then validate the object with a validator created with `ajv.compile`. It's not performant, looks suspicious, but seems to work.

**Your code**

```javascript
import Ajv from 'ajv/dist/jtd';

const schema = {
    properties: {
        field: {
            metadata: {
                union: [{ type: 'string' }, { type: 'boolean' }],
            },
        },
    },
}

const ajv = new Ajv();
const data = { field: 10000 };

// Compile
const compileInstance = ajv.compile(schema);
const resultCompile = compileInstance(data)
console.log(resultCompile);
console.log(compileInstance.errors);

// Parser
const parserInstance = ajv.compileParser(schema);
const resultParser = parserInstance(JSON.stringify(data));
console.log(resultParser);
console.log(parserInstance);
```
