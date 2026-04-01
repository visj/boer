# [950] Request to make console optional for default construction

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for compatibility issues.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**The version of Ajv you are using**
latest

**The environment you have the problem with**
NodeJS vm.js

**Your code (please make it as small as possible to reproduce the issue)**
```
var Ajv = require('ajv'),
    ajv = new Ajv(); // note {logger: console} not provided
```

**Issue**
Ajv assumes console to be present in the environment. It is an acceptable for all normal use cases. But we use AJV within Node VM module and that is sandboxed to not have console.

The following line https://github.com/epoberezkin/ajv/blob/master/lib/ajv.js#L488 assumes console to be present. This results in issues such as https://github.com/postmanlabs/postman-app-support/issues/3199 and requires to have a longer boilerplate code.

If it is okay, we can send a PR that checks if console is absent even in global scope and injects a stub.