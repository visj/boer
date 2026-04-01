# [1617] [docs] relation between JTDSchemaType and JTDDataType

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? `8.4.0` Does the issue happen if you use the latest version?** Yes

**JTD Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```ts
export interface REQ {
	data: {
		text: string,
	}
};
export const Req: JTDSchemaType<REQ> = {
	properties: {
		data: {
			properties: {
				text: { type: 'string' },
			},
		},
	},
};
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

```ts
type ReqD = JTDDataType<typeof Req>
/* {
    data: {
        text: unknown;
    } & {};
} & {} */

type ReqD2 = JTDDataType<typeof Req.properties.data>
/*  {
    text: unknown;
} & {}; */
```

**What results did you expect?**

```ts
JTDDataType<typeof Req.properties.data>
// { text: string }
```


**Are you going to resolve the issue?**

If this is a bug, and I know where to start, sure.
