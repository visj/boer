# [2476] RE2 integration incorrectly typed

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html

This template is for issues about missing or incorrect type definition and other typescript-related issues.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Yes - issue happens with the latest version (currently v8.17.1).

**Your typescript code**

<!--
Please make it as small as possible to reproduce the issue
-->

```typescript

import RE2 from "re2";
import Ajv from "ajv";

const ajv = new Ajv({
  code: { regExp: RE2 },
});

```

**Typescript compiler error messages**

```
Property 'code' is missing in type 'RE2Constructor' but required in type 'RegExpEngine'.  ts(2741)
```

**Describe the change that should be made to address the issue?**

The code property should potentially be marked as optional in the RegExpEngine interface since it is ["only needed for standalone code generation"](https://github.com/ajv-validator/ajv/pull/1684#discussion_r747459311): https://github.com/ajv-validator/ajv/blob/9050ba1359fb87cd7c143f3c79513ea7624ea443/lib/types/index.ts#L233

**Are you going to resolve the issue?**

Happy to submit a PR if that is desired.
