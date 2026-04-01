# [1061] More Exhaustive ISO 8601 timezone offset support

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv you are you using?**
6.10.2

**What problem do you want to solve?**
More exhaustive support of ISO8601 timezone/time offset representations for "time" and "date-time" JSON Schema format validators.

**What do you think is the correct solution to problem?**
Update the regular expressions used for "time" and "date-time" in both "full" and "fast" format modes.

**Will you be able to implement it?**
Yes

**Examples of unsupported but ISO8601 compliant "time" and "date-time" formats:**

**Times:**
`"02:31:17+0130"`
`"02:31:17-05"`

**Date Times:**
`"2016-01-31T02:31:17+0130"`
`"2016-01-31T02:31:17-01"`