# [2458] 'v' pattern flag support, log descriptive errors for invalid (failing to compile) regexp's

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**
latest

**What problem do you want to solve?**
Missing support for new 'v' regexp flag (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Character_class#v-mode_character_class).
Now regexp, that fail to compile, break validator totally. An exception is not descriptive, it's hard to find the location of a failing pattern keyword.

**What do you think is the correct solution to problem?**
Add optional support for new 'v' regexp flag. Catch regexp initialization exceptions and log descriptive errors to console including invalid regexp itself. For example: "pattern 'xxx' at <json pointer to schema node> failed to compile with 'u' flag: <exception message>. Check regexp validity or try changing compilation flag".

**Will you be able to implement it?**
Yes, but need to discuss new option for enabling 'v' flag.