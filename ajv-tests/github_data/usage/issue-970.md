# [970] removeAdditional does not work with dependencies

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Latest version

**Description:**
When I have a schema with dependencies, and set `removeAdditional` to `true`, then the extra fields added in the dependencies are always removed -- while I expect them to be kept in some cases.

**JSFiddle**:
https://jsfiddle.net/epicfaace/L3jf7uvy/

**Expected results**:
I expect the following to be console logged:
```
{name: "abc", credit_card: 123, billing_address: "abc"}
```

**Actual results**
The following is console logged:
```
{name: "abc", credit_card: 123}
```