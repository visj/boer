# [2123] Can't create JTDSchemaType from tagged union with no additional properties

**What I'm trying to do**
I want to use the JTDSchemaType to create a schema for messages I will pass through a websocket. The messages have a `type` field used with a discriminator in the schema. Some of the messages require no additional information, such as a "ping" message, but I am getting an error when creating the `JTDSchemaType` unless there are additional properties.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
v8.11

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{}
```



**Your code**

<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://ajv.js.org/guide/getting-started.html
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```typescript
import Ajv, { JTDSchemaType } from "ajv/dist/jtd";

const ajv = new Ajv();

type Message = { type: "ping" } // causes error unless an additional property is added
            |  { type: "error"; message: string };

const schema: JTDSchemaType<Message> = {
  discriminator: "type",
  mapping: {
    ping: {
      properties: {}, // compile error because ping is type 'never'
    },
    error: {
      properties: {
        message: { type: "string" },
      },
    },
  },
};
```



**What results did you expect?**
I expect to be able to create a schema for a tagged union that has no properties except the tag. I can't compile this because typescript expects the mapping of `ping` to be type `never`.

**Are you going to resolve the issue?**
I'm not sure how, but I'm happy to help.