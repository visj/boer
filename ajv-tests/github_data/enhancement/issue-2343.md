# [2343] Drop dependency on uri-js/punycode

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**

v6.12.6

**What problem do you want to solve?**

Logs being flooded with deprecation warnings:

```
contra-api:test:vitest: (Use `node --trace-deprecation ...` to show where the warning was created)
contra-api:test:vitest: (node:747235) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
contra-api:test:vitest: (Use `node --trace-deprecation ...` to show where the warning was created)
contra-api:test:vitest: (node:747235) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
contra-api:test:vitest: (Use `node --trace-deprecation ...` to show where the warning was created)
contra-api:test:vitest: (node:747235) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
contra-api:test:vitest: (Use `node --trace-deprecation ...` to show where the warning was created)
contra-api:test:vitest: (node:747235) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
contra-api:test:vitest: (Use `node --trace-deprecation ...` to show where the warning was created)
contra-api:test:vitest: (node:747235) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
contra-api:test:vitest: (Use `node --trace-deprecation ...` to show where the warning was created)
contra-api:test:vitest: (node:747235) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
contra-api:test:vitest: (Use `node --trace-deprecation ...` to show where the warning was created)
```

**What do you think is the correct solution to problem?**

* Drop Node.js support outside of LTE
* Drop uri-js (which depends on punycode)

**Will you be able to implement it?**

Yes


Related issues:

* https://github.com/garycourt/uri-js/issues/94

Note:

* My understanding is that the only reason for uri-js is backwards compatibility for older Node.js versions.