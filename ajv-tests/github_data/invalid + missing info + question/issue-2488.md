# [2488] [feature request] Add more formats and support for `qt-*` keys

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**
`@master`

**What problem do you want to solve?**
```
Failed to validate: unknown format "boolean" ignored in schema at path "#/properties/App_RapidStartup"
similar error for qt-uri-protocols and qt-uri-extensions
```

**What do you think is the correct solution to problem?**
For example https://app.quicktype.io/schema is producing a lot of [`boolean`](https://github.com/Bluscream/AMPTemplates/actions/runs/10434803032) and it also produces `"qt-uri-protocols": ` and `"qt-uri-extensions": ` for URIs which would be nice if supported but atleast shouldnt fail the validation

- [ ] Support boolean as format `/(true|false|0|1|yes|no|enabled|disabled|on|off)/ig`
- [ ] Add option to ignore unknown formats
- [ ] Support validating `qt-uri-protocols` and `qt-uri-extensions`
- [ ] Add option to ignore unknown keys entirely or just to ignore the unsupported `qt-*` keys

**Will you be able to implement it?**
No