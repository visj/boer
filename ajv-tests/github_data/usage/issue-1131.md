# [1131] validateSchema error on unencoded definition names

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv you are you using?**
6.10.2

**What problem do you want to solve?**
Validate JSON Schemas are compliant with spec for use with other systems i.e. AWS

**What do you think is the correct solution to problem?**
validateSchema should throw if definitions are not valid URI paths
Currently it coerces them

**Will you be able to implement it?**
Maybe.

I think this runkit should fail https://runkit.com/embed/wp25psmgtnwn
definition names have < and > in them