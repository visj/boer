# [1128] NaN and Infinity should fail type:number with option strictNumbers

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What problem do you want to solve?**

https://github.com/epoberezkin/ajv/issues/182#issuecomment-219548557

**What do you think is the correct solution to problem?**

Option changing type validation. Check if these values are coercible to strings - with this option coercion should fail too

**Will you be able to implement it?**

Maybe
