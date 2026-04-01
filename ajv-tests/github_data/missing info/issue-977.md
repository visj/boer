# [977] Strict mode: Cannot assign to read only property 'constructor' of object 'Error'

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- browser/compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

ajv@6.10.0, happens with the latest version

**Ajv options object**

No options set

No Options

**JSON Schema**

No Schema

**Sample data**

No Sample


**Your code**

Change lib/compile/error_classes.js so that strict mode will not throw errors

 function errorSubclass(Subclass) {
   Subclass.prototype = Object.create(Error.prototype);
\-  Subclass.prototype.constructor = Subclass;
\+  Object.defineProperty(Subclass, 'constructor', {
\+    enumerable: false,
\+    configurable: false,
\+    writable: false,
\+    value: Subclass
\+  });
\+
   return Subclass;
 }

**Validation result, data AFTER validation, error messages**
Strict mode no longer throws errors

**What results did you expect?**
Strict mode to not throw errors

**Are you going to resolve the issue?**
I have a branch
