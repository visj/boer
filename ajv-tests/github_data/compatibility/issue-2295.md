# [2295] Uncaught ReferenceError: exports is not defined

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for compatibility issues.
For other issues please see https://ajv.js.org/contributing/
-->

**The version of Ajv you are using**
8.12.0

**The environment you have the problem with**
Firefox, Chrome

**Your code (please make it as small as possible to reproduce the issue)**
I'm loading it with this in my HTML:

```
<!DOCTYPE html>
<html lang="en">
  <head>
    <script src="https://unpkg.com/ajv@8.12.0/dist/ajv.js"></script>
  </head>
  <body></body>
</html>
```

**Results and error messages in your platform**
The browser console gives me this error:
```
Uncaught ReferenceError: exports is not defined
    <anonymous> https://unpkg.com/ajv@8.12.0/dist/ajv.js:2
```

I'm sorry, I assume I must be doing something wrong... 