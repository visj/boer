# [1410] Proposal: allow default to take a function

**What version of Ajv you are you using?**
7.0.3

**What problem do you want to solve?**
Simplify dynamic default value generation.

The current way to generate default values is needlessly complex. As it stands, as described [here](https://github.com/ajv-validator/ajv-keywords#dynamicdefaults) the only way to dynamically generate default values for parameters is to define the value generators in a property that is disconnected from the property itself:

```js
const schema = {
  type: "object",
  dynamicDefaults: {
    foo: "datetime",
  },
  properties: {
    foo: {
      type: "string",
      format: "date-time",
    },
  },
}

const data = {};
ajv.validate(data); // true
data // { foo: '2021-01-26T21:40:30Z' };
```

Not only is this clunky to visually parse, it makes larger schemas more difficult to maintain. The built-in dynamic default generators, while well-intentioned, further complicate the issue by requiring the programmer to know what the "name" of each generator is.

In addition to this, specifying custom generators necessitates `require`ing a file deep in the package and assigning defaults to a cached value within the package itself:

```js
const uuid = require("uuid");

function getUuid(args) {
  const version = "v" + ((arvs && args.v) || "4");
  return uuid[version];
}

const def = require("ajv-keywords/dist/definitions/dynamicDefaults");
def.DEFAULTS.uuid = getUuid;

const schema = {
  dynamicDefaults: {
    id1: "uuid", // v4
    id2: {func: "uuid", v: 4}, // v4
    id3: {func: "uuid", v: 1}, // v1
  },
};
```

This approach is cludgy and needlessly complex, and the resulting schema becomes cryptic and difficult to understand as programmers will need to use just a string-based keyword to track down the generator function to see what it does.

The solution proposed at #555 is a step in the right direction, but it still relies on string-based identifiers that have no strong link to the functions themselves.

**What do you think is the correct solution to problem?**

I propose that the `default` property be able to accept a function, whether a reference, an anonymous function, or a lambda function. When the analyzer detects that the value of `default` is a function, instead of assigning the value directly to the input, it calls the function and assigns the returned value. (This returned value would have to be validated to ensure it is a legal value in the property definition.)

```js
const uuid = require("uuid");

const schema = {
  type: "object",
  properties: {
    foo: {
      type: "string",
      format: "date-time",
      default: () => new Date().toISOString(),
    },
    bar: {
      type: "string",
      default: uuid.v4
    },
  },
}

const data = {};
ajv.validate(data); // true
data // { foo: '2021-01-26T21:40:30Z', bar: '105e9224-601f-11eb-ae93-0242ac130002' }
```

Having the functions either declared within the schema or hard-linked via a reference makes the dynamic default generators much easier to locate and the schema overall much easier to read and maintain. It also means the built-in generators can be referenced by name as well instead of depending on arbitrary keywords, which in turn makes them a lot easier to find and understand via IntelliSense:

```js
// in ajv-defaults.js
module.exports.datetime = function() {
 return new Date().toISOString();
}

// in main.js
const { datetime } = require('ajv-defaults');

const schema = {
  type: "object",
  properties: {
    foo: {
      type: "string",
      format: "date-time",
      default: datetime,
    },
  },
}

const data = {};
ajv.validate(data); // true
data // { foo: '2021-01-26T21:40:30Z' }
```

Using this approach, the function should be parameterless so as to keep the generation free from side-effects. If for whatever reason the function needs to take a parameter, the parameter can be provided via a lambda wrapper:

```js
function add(n) {
  return n + 5;
}

const schema = {
  type: "object",
  properties: {
    foo: {
      type: "number",
      default: () => add(3),
    },
    bar: {
      type: "number",
      default: () => add(7),
    },
  },
}

const data = {};
ajv.validate(data); // true
data // { foo: 8, bar: 12 }
```

**Will you be able to implement it?**
I would certainly be willing to try, but I am currently writing this proposal in between work-related crunches, so I cannot guarantee I would have time to write a robust and tested implementation. If nothing else, I will try to throw together a proof-of-concept at some point.