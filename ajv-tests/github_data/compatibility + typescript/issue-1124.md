# [1124] '$comment' option is not described in ajv.d.ts

ajv v.6.10.2

In Typescript, it is impossible to use '$comment' option because it is not defined in ajv.d.ts:

const ajv = new Ajv({ '$comment': someFunction });

Typescript 3.6.3 compiler error:

Argument of type '{'$comment': (value: any, path: any, schema: any) => void; }' is not assignable to parameter of type 'Options'.
  Object literal may only specify known properties, and ''$comment'' does not exist in type 'Options'.
