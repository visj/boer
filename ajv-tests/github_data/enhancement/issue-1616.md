# [1616] [Feature Request]: JTD generics type utility

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**
`8.4.0`

**What problem do you want to solve?**
Currently, for schemas where everything has a standard base interface, e.g. `{data: T}`, there's no good way to do this without having to write it for every interface.

I've already tried using a generic function, but `JTDSchemaType` seems to not like it. e.g.

```ts
export type REQ_WRAPPER<T> = {
	data: T;
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getREQ_WRAPPER = <T>(v: T) => ({
	properties:{
		data: v,
	},
});
export type REQ = REQ_WRAPPER<{
	username:string,
	password:string,
}>;
export const loginReq: JTDSchemaType<REQ> = getREQ_WRAPPER({
	properties:{
		username:{type:'string'},
		password:{type:'string'},
	},
});
```

Doing this seems to prevent getting any intellisense and I'm pretty sure the actual type being returned isn't fully typed.

**What do you think is the correct solution to problem?**

Since the `JTDSchemaType` is already so complex, perhaps this should be a separate type that just makes it compatible with being fed into `JTDSchemaType`? I'm not completely sure since I don't understand `JTDSchemaType`  very well.

**Will you be able to implement it?**

Probably not, depends on whether it can be implemented independently of `JTDSchemaType` .
