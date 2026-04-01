# [996] Time format validation enhancement 

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv you are you using?**
6.10.0
**What problem do you want to solve?**
No validation for incorrect time format in field definition `{"type": "string", "format": "time"}`. For example: `25:00:00` [(example code)](https://runkit.com/embed/ya39gg9nlzuq) 
**What do you think is the correct solution to problem?**
Change code in `file lib/compile/formats.js`:
AS IS: 
`var TIME = /^(\d\d):(\d\d):(\d\d)(\.\d+)?(z|[+-]\d\d:\d\d)?$/i;`
TOBE: 
`var TIME = /^(2[0-3]|[01]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])(\.\d+)?(z|[+-]\d\d:\d\d)?$/i;`
**Will you be able to implement it?**
No sure if I can manage all necessary auto tests, but I can try