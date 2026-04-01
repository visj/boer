# [1923] Support of hermes js engine for react native

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for compatibility issues.
For other issues please see https://ajv.js.org/contributing/
-->
This is probably very niche and low priority issue, but I was trying to use ajv in react-native today via enabling their hermes js engine and unfortunately ajv breaks that build, likely due to using some unsupported js methods / packages.

**The version of Ajv you are using**
8.10.0

**The environment you have the problem with**
react-native via hermes engine (https://hermesengine.dev)

**Your code (please make it as small as possible to reproduce the issue)**
none

**If your issue is in the browser, please list the other packages loaded in the page in the order they are loaded. Please check if the issue gets resolved (or results change) if you move Ajv bundle closer to the top**
none

**Results in node.js v8+**
none

**Results and error messages in your platform**
In my case error that popped up was not descriptive enough to point to one specific area of ajv, it just said that main react entry file was invalid and only occurs when ajv is imported/
