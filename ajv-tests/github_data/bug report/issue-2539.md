# [2539] Ajv is not constructable for typescript files.

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
   Ajv version: 8.17.1

**Your code**
```javascript
 const ajv = new Ajv();


```

**Validation result, data AFTER validation, error messages**

```javascript
This expression is not constructable.
  Type 'typeof import("c:/Users/MY PC/Desktop/MERN Projects/Scents/apps/scenty/backend/node_modules/ajv/dist/ajv")' has no construct signatures.
```

**What results did you expect?**
Expectation is that the Ajv object should be created without errors.

**Are you going to resolve the issue?**
I am exploring the codebase and will raise a PR if found a potential solution or workaround.

PS: My code snapshot: 

![Image](https://github.com/user-attachments/assets/000eee41-8088-4820-9c87-727db66f9fad)