# [1744] Cannot load the library from the browser

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for installation and dependency issues.
For other issues please see https://ajv.js.org/contributing/

Before submitting the issue, please try the following:
- use the latest stable Node.js and npm
- use yarn instead of npm - the issue can be related to https://github.com/npm/npm/issues/19877
- remove node_modules and package-lock.json and run install again
-->

**The version of Ajv you are using**
It works up to AJV 8.1.0. The bug start appearing with AJV 8.2.0.

**Operating system and node.js version**
Windows 10 / Firefox 91.0.2 (64-bit)
No node.js is used, I try to use the library from the browser.

**Error messages**
The following error message appears: "Uncaught ReferenceError: module is not defined"

This file shows the bug:
```html
<!DOCTYPE html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/ajv/8.2.0/ajv7.min.js" integrity="sha512-SCRZbjxuvVmyvTsdMQBqupxRyXLjCMv+2rukfZWxlaalrbb/LVbPwRr844LmbPqIhVYTnWNocLCW9DxRo3qyuA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
</head>
```

With this file, everything is file:
```html
<!DOCTYPE html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/ajv/8.1.0/ajv7.min.js" integrity="sha512-iG/rBFw+Q1mlDQt15pw86zil1/1JeeNoJ1Grux8zZgvIBLDDnRLdA8UaIosHohzrqBEXA2+hIQV7DXnYGYGX/g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
</head>
```