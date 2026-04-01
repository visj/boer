# [1608] $ref vs inlining schema/definition object

Maybe I'm missing something, but why should one use `$ref` when working in a JS-oriented environment?

For example, if I have partials/definitions that all validate one field of a user account:

```js
// src/user.js

export const usernameSchema = {
	type: "string",
	minLength: 5,
	maxLength: 100,
	pattern: "^[a-zA-Z]{5,100}$"
};

export const passwordSchema = {
    type: "string",
    minLength: 12
};
```

```js
// src/form.js

import { usernameSchema, passwordSchema } from "./form.js";

const registrationFormSchema = {
	type: "object",
	required: ["username", "password"],
	properties: { username: usernameSchema, password: passwordSchema } // import instead of { $ref: "..." }
};
```

\- Is it a bad practice to reuse these by importing them in other JS modules and then inlining them directly?
(Instead of putting them in a `"definitions"` and then using `"$ref"` to reference them)

I assume doing something like this would cause compilation "bloat" because the same code is generated multiple times. Same as the `inlineRefs` option.
