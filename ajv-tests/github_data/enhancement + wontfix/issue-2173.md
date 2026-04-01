# [2173] Is extending pre-defined keywords supported?

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**
8.11.2

**What problem do you want to solve?**
We have a need to extend validation for all "string" types in our JSON schemas. Reading through the Ajv documentation, I see what appears to be conflicting messages about this possibility. 

In the [addKeyword](https://ajv.js.org/api.html#ajv-addkeyword-definition-string-object-ajv) reference it says:
> There is no way to redefine keywords or to remove keyword definition from the instance.

But then in the [removeKeyword](https://ajv.js.org/api.html#ajv-removekeyword-keyword-string-ajv) reference it says:
> Removes added or pre-defined keyword so you can redefine them.

> While this method can be used to extend pre-defined keywords, it can also be used to completely change their meaning - it may lead to unexpected results.

Which is correct? 

Assuming it is a supported, what would be the best way to keep the existing type validation for all types, but add an extra validation function for string type values?

I understand we could add a new keyword or format to do this, but we'd prefer not to have to modify our extensive set of schemas to accomplish this.

Thank you for any help.