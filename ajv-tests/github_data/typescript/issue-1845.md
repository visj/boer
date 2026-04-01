# [1845] The type definition of $ref not correctly resolve

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html

This template is for issues about missing or incorrect type definition and other typescript-related issues.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.8.2, yes
**Your typescript code**

<!--
Please make it as small as possible to reproduce the issue
-->

```typescript
import Ajv, { JSONSchemaType } from "ajv";
const ajv = new Ajv({
	allErrors: true,
});

interface EventChainJSON {
  [key: string]: EventChain;
}

interface EventChain {
  main: AtomicEvent;
  [key: string]: AtomicEvent;
}

interface AtomicEvent {
  type: string;
  version?: string;
  params?: { [key: string]: any };
  callback?: { [key: string]: NextEvent };
  next?: NextEvent;
}

type NextEvent = AtomicEvent | string;

const schema: JSONSchemaType<EventChainJSON> & {
  definitions: {
    ec: JSONSchemaType<EventChain>;
    ae: JSONSchemaType<AtomicEvent>;
    ne: JSONSchemaType<NextEvent>;
  };
} = {
  definitions: {
    ec: {
      type: "object",
      properties: {
        main: { $ref: "#/definitions/ae" },
      },
      additionalProperties: { $ref: "#/definitions/ae" },
    },
    ae: {
      type: "object",
      properties: {
        type: { type: "string" },
        version: { type: "string" },
        params: { type: "object" },
        callback: {
          type: "object",
          additionalProperties: {
            $ref: "#/definitions/ne",
          },
        },
        next: {
          $ref: "#/definitions/ne",
        },
      },
      required: ["type"],
      additionalProperties: false,
    },
    ne: {
      anyOf: [{ type: "string" }, { $ref: "#/definitions/ae" }],
    },
  },
  type: "object",
  additionalProperties: { $ref: "#/definitions/ec" },
};
```

**Typescript compiler error messages**

```
TSError: ⨯ Unable to compile TypeScript:
ajv.ts:33:5 - error TS2322: Type '{ type: "object"; properties: { main: { $ref: string; }; }; additionalProperties: { $ref: string; }; }' is not assignable to type 'UncheckedJSONSchemaType<EventChain, false>'.
  Types of property 'additionalProperties' are incompatible.
    Type '{ $ref: string; }' is not assignable to type 'boolean | UncheckedJSONSchemaType<AtomicEvent, false> | undefined'.
      Type '{ $ref: string; }' is not assignable to type '{ type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; } & { ...; } & { ...; } & { ...; }'.
        Property 'type' is missing in type '{ $ref: string; }' but required in type '{ type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; }'.

33     ec: {
       ~~

  node_modules/ajv/dist/types/json-schema.d.ts:57:5
    57     type: JSONType<"object", IsPartial>;
           ~~~~
    'type' is declared here.
  ajv.ts:27:5
    27     ec: JSONSchemaType<EventChain>;
           ~~
    The expected type comes from property 'ec' which is declared here on type 'Record<string, UncheckedJSONSchemaType<Known, true>> & { ec: UncheckedJSONSchemaType<EventChain, false>; ae: UncheckedJSONSchemaType<...>; ne: UncheckedJSONSchemaType<...>; }'
ajv.ts:40:5 - error TS2322: Type '{ type: "object"; properties: { type: { type: "string"; }; version: { type: "string"; }; params: { type: "object"; }; callback: { type: "object"; additionalProperties: { $ref: string; }; }; next: { $ref: string; }; }; required: "type"[]; additionalProperties: false; }' is not assignable to type 'UncheckedJSONSchemaType<AtomicEvent, false>'.
  The types of 'properties.version' are incompatible between these types.
    Type '{ type: "string"; }' is not assignable to type '{ $ref: string; } | (UncheckedJSONSchemaType<string | undefined, false> & { nullable: true; const?: null | undefined; enum?: readonly (string | null | undefined)[] | undefined; default?: string | ... 1 more ... | undefined; })'.
      Type '{ type: "string"; }' is not assignable to type '{ type: "string"; } & StringKeywords & { allOf?: readonly UncheckedPartialSchema<string | undefined>[] | undefined; anyOf?: readonly UncheckedPartialSchema<string | undefined>[] | undefined; ... 4 more ...; not?: UncheckedPartialSchema<...> | undefined; } & { ...; } & { ...; }'.
        Property 'nullable' is missing in type '{ type: "string"; }' but required in type '{ nullable: true; const?: null | undefined; enum?: readonly (string | null | undefined)[] | undefined; default?: string | null | undefined; }'.

40     ae: {
       ~~

  node_modules/ajv/dist/types/json-schema.d.ts:115:5
    115     nullable: true;
            ~~~~~~~~
    'nullable' is declared here.
  ajv.ts:28:5
    28     ae: JSONSchemaType<AtomicEvent>;
           ~~
    The expected type comes from property 'ae' which is declared here on type 'Record<string, UncheckedJSONSchemaType<Known, true>> & { ec: UncheckedJSONSchemaType<EventChain, false>; ae: UncheckedJSONSchemaType<...>; ne: UncheckedJSONSchemaType<...>; }'
ajv.ts:59:5 - error TS2322: Type '{ anyOf: ({ type: "string"; } | { $ref: string; })[]; }' is not assignable to type 'UncheckedJSONSchemaType<NextEvent, false>'.
  Type '{ anyOf: ({ type: "string"; } | { $ref: string; })[]; }' is not assignable to type '{ type: "string"; } & StringKeywords & { allOf?: readonly UncheckedPartialSchema<NextEvent>[] | undefined; anyOf?: readonly UncheckedPartialSchema<NextEvent>[] | undefined; ... 4 more ...; not?: UncheckedPartialSchema<...> | undefined; } & { ...; }'.
    Property 'type' is missing in type '{ anyOf: ({ type: "string"; } | { $ref: string; })[]; }' but required in type '{ type: "string"; }'.

59     ne: {
       ~~

  node_modules/ajv/dist/types/json-schema.d.ts:31:5
    31     type: JSONType<"string", IsPartial>;
           ~~~~
    'type' is declared here.
  ajv.ts:29:5
    29     ne: JSONSchemaType<NextEvent>;
           ~~
    The expected type comes from property 'ne' which is declared here on type 'Record<string, UncheckedJSONSchemaType<Known, true>> & { ec: UncheckedJSONSchemaType<EventChain, false>; ae: UncheckedJSONSchemaType<...>; ne: UncheckedJSONSchemaType<...>; }'

    at createTSError (/usr/local/lib/node_modules/ts-node/src/index.ts:750:12)
    at reportTSError (/usr/local/lib/node_modules/ts-node/src/index.ts:754:19)
    at getOutput (/usr/local/lib/node_modules/ts-node/src/index.ts:941:36)
    at Object.compile (/usr/local/lib/node_modules/ts-node/src/index.ts:1243:30)
    at Module.m._compile (/usr/local/lib/node_modules/ts-node/src/index.ts:1370:30)
    at Module._extensions..js (node:internal/modules/cjs/loader:1153:10)
    at Object.require.extensions.<computed> [as .ts] (/usr/local/lib/node_modules/ts-node/src/index.ts:1374:12)
    at Module.load (node:internal/modules/cjs/loader:981:32)
    at Function.Module._load (node:internal/modules/cjs/loader:822:12)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:79:12) {
  diagnosticText: `\x1B[96majv.ts\x1B[0m:\x1B[93m33\x1B[0m:\x1B[93m5\x1B[0m - \x1B[91merror\x1B[0m\x1B[90m TS2322: \x1B[0mType '{ type: "object"; properties: { main: { $ref: string; }; }; additionalProperties: { $ref: string; }; }' is not assignable to type 'UncheckedJSONSchemaType<EventChain, false>'.\n` +
    "  Types of property 'additionalProperties' are incompatible.\n" +
    "    Type '{ $ref: string; }' is not assignable to type 'boolean | UncheckedJSONSchemaType<AtomicEvent, false> | undefined'.\n" +
    `      Type '{ $ref: string; }' is not assignable to type '{ type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; } & { ...; } & { ...; } & { ...; }'.\n` +
    `        Property 'type' is missing in type '{ $ref: string; }' but required in type '{ type: "object"; additionalProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; unevaluatedProperties?: boolean | UncheckedJSONSchemaType<unknown, false> | undefined; ... 7 more ...; maxProperties?: number | undefined; }'.\n` +
    '\n' +
    '\x1B[7m33\x1B[0m     ec: {\n' +
    '\x1B[7m  \x1B[0m \x1B[91m    ~~\x1B[0m\n' +
    '\n' +
    '  \x1B[96mnode_modules/ajv/dist/types/json-schema.d.ts\x1B[0m:\x1B[93m57\x1B[0m:\x1B[93m5\x1B[0m\n' +
    '    \x1B[7m57\x1B[0m     type: JSONType<"object", IsPartial>;\n' +
    '    \x1B[7m  \x1B[0m \x1B[96m    ~~~~\x1B[0m\n' +
    "    'type' is declared here.\n" +
    '  \x1B[96majv.ts\x1B[0m:\x1B[93m27\x1B[0m:\x1B[93m5\x1B[0m\n' +
    '    \x1B[7m27\x1B[0m     ec: JSONSchemaType<EventChain>;\n' +
    '    \x1B[7m  \x1B[0m \x1B[96m    ~~\x1B[0m\n' +
    "    The expected type comes from property 'ec' which is declared here on type 'Record<string, UncheckedJSONSchemaType<Known, true>> & { ec: UncheckedJSONSchemaType<EventChain, false>; ae: UncheckedJSONSchemaType<...>; ne: UncheckedJSONSchemaType<...>; }'\n" +
    `\x1B[96majv.ts\x1B[0m:\x1B[93m40\x1B[0m:\x1B[93m5\x1B[0m - \x1B[91merror\x1B[0m\x1B[90m TS2322: \x1B[0mType '{ type: "object"; properties: { type: { type: "string"; }; version: { type: "string"; }; params: { type: "object"; }; callback: { type: "object"; additionalProperties: { $ref: string; }; }; next: { $ref: string; }; }; required: "type"[]; additionalProperties: false; }' is not assignable to type 'UncheckedJSONSchemaType<AtomicEvent, false>'.\n` +
    "  The types of 'properties.version' are incompatible between these types.\n" +
    `    Type '{ type: "string"; }' is not assignable to type '{ $ref: string; } | (UncheckedJSONSchemaType<string | undefined, false> & { nullable: true; const?: null | undefined; enum?: readonly (string | null | undefined)[] | undefined; default?: string | ... 1 more ... | undefined; })'.\n` +
    `      Type '{ type: "string"; }' is not assignable to type '{ type: "string"; } & StringKeywords & { allOf?: readonly UncheckedPartialSchema<string | undefined>[] | undefined; anyOf?: readonly UncheckedPartialSchema<string | undefined>[] | undefined; ... 4 more ...; not?: UncheckedPartialSchema<...> | undefined; } & { ...; } & { ...; }'.\n` +
    `        Property 'nullable' is missing in type '{ type: "string"; }' but required in type '{ nullable: true; const?: null | undefined; enum?: readonly (string | null | undefined)[] | undefined; default?: string | null | undefined; }'.\n` +
    '\n' +
    '\x1B[7m40\x1B[0m     ae: {\n' +
    '\x1B[7m  \x1B[0m \x1B[91m    ~~\x1B[0m\n' +
    '\n' +
    '  \x1B[96mnode_modules/ajv/dist/types/json-schema.d.ts\x1B[0m:\x1B[93m115\x1B[0m:\x1B[93m5\x1B[0m\n' +
    '    \x1B[7m115\x1B[0m     nullable: true;\n' +
    '    \x1B[7m   \x1B[0m \x1B[96m    ~~~~~~~~\x1B[0m\n' +
    "    'nullable' is declared here.\n" +
    '  \x1B[96majv.ts\x1B[0m:\x1B[93m28\x1B[0m:\x1B[93m5\x1B[0m\n' +
    '    \x1B[7m28\x1B[0m     ae: JSONSchemaType<AtomicEvent>;\n' +
    '    \x1B[7m  \x1B[0m \x1B[96m    ~~\x1B[0m\n' +
    "    The expected type comes from property 'ae' which is declared here on type 'Record<string, UncheckedJSONSchemaType<Known, true>> & { ec: UncheckedJSONSchemaType<EventChain, false>; ae: UncheckedJSONSchemaType<...>; ne: UncheckedJSONSchemaType<...>; }'\n" +
    `\x1B[96majv.ts\x1B[0m:\x1B[93m59\x1B[0m:\x1B[93m5\x1B[0m - \x1B[91merror\x1B[0m\x1B[90m TS2322: \x1B[0mType '{ anyOf: ({ type: "string"; } | { $ref: string; })[]; }' is not assignable to type 'UncheckedJSONSchemaType<NextEvent, false>'.\n` +
    `  Type '{ anyOf: ({ type: "string"; } | { $ref: string; })[]; }' is not assignable to type '{ type: "string"; } & StringKeywords & { allOf?: readonly UncheckedPartialSchema<NextEvent>[] | undefined; anyOf?: readonly UncheckedPartialSchema<NextEvent>[] | undefined; ... 4 more ...; not?: UncheckedPartialSchema<...> | undefined; } & { ...; }'.\n` +
    `    Property 'type' is missing in type '{ anyOf: ({ type: "string"; } | { $ref: string; })[]; }' but required in type '{ type: "string"; }'.\n` +
    '\n' +
    '\x1B[7m59\x1B[0m     ne: {\n' +
    '\x1B[7m  \x1B[0m \x1B[91m    ~~\x1B[0m\n' +
    '\n' +
    '  \x1B[96mnode_modules/ajv/dist/types/json-schema.d.ts\x1B[0m:\x1B[93m31\x1B[0m:\x1B[93m5\x1B[0m\n' +
    '    \x1B[7m31\x1B[0m     type: JSONType<"string", IsPartial>;\n' +
    '    \x1B[7m  \x1B[0m \x1B[96m    ~~~~\x1B[0m\n' +
    "    'type' is declared here.\n" +
    '  \x1B[96majv.ts\x1B[0m:\x1B[93m29\x1B[0m:\x1B[93m5\x1B[0m\n' +
    '    \x1B[7m29\x1B[0m     ne: JSONSchemaType<NextEvent>;\n' +
    '    \x1B[7m  \x1B[0m \x1B[96m    ~~\x1B[0m\n' +
    "    The expected type comes from property 'ne' which is declared here on type 'Record<string, UncheckedJSONSchemaType<Known, true>> & { ec: UncheckedJSONSchemaType<EventChain, false>; ae: UncheckedJSONSchemaType<...>; ne: UncheckedJSONSchemaType<...>; }'\n",
  diagnosticCodes: [ 2322, 2322, 2322 ]
}
```

**Describe the change that should be made to address the issue?**
The type definition of $ref should be correctly resolved
**Are you going to resolve the issue?**
no