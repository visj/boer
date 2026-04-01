# [1844] Replace uri-js by fast-uri

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

fast-uri is a fork of uri-js which is rewritten in javascript to focus on performances issues.

**What version of Ajv you are you using?**

Ajv 8.8.2

**What problem do you want to solve?**
Speed improvement

**What do you think is the correct solution to problem?**
As discussed with @epoberezkin , an option can be added to inject `fast-uri` to replace `uri-js` to not have a breaking change in the current version

**Will you be able to implement it?**

Yes

Ref: https://github.com/fastify/fast-uri