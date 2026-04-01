# [570] TypeScript definition for FormatValidator is incorrect

I'm pretty sure the TypeScript definition for [FormatValidator](https://github.com/epoberezkin/ajv/blob/9a13b2835f7ab5217c1cec3dd4f1de2a64ce8e7b/lib/ajv.d.ts#L152) is incorrect.

It should return allow a `Promise<boolean>` to be returned if `async` is `true`, no?

I'm getting errors when trying to copy from [this Twitter example](https://runkit.com/esp/ajv-asynchronous-validation).