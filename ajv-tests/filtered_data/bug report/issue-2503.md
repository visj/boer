# [2503] urnSerialize Fails Unexpectedly

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Using version `8.12.0` up to `8.16.0` works, latest version fails.

Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'toLowerCase')
    at Object.urnSerialize [as serialize] (ajv_dist_2020.js?v=7ea982fe:3411:37)
    at Object.serialize (ajv_dist_2020.js?v=7ea982fe:3592:67)
    at _getFullPath (ajv_dist_2020.js?v=7ea982fe:2215:35)
    at getFullPath (ajv_dist_2020.js?v=7ea982fe:2211:14)
    at Ajv2020.getSchemaRefs (ajv_dist_2020.js?v=7ea982fe:2236:26)
    at Ajv2020._addSchema (ajv_dist_2020.js?v=7ea982fe:4195:51)
    at Ajv2020.addSchema (ajv_dist_2020.js?v=7ea982fe:3993:34)
    at Ajv2020.addInitialSchemas (ajv_dist_2020.js?v=7ea982fe:4253:16)
    at new Ajv (ajv_dist_2020.js?v=7ea982fe:3887:27)
    at new Ajv2020 (ajv_dist_2020.js?v=7ea982fe:6903:9)

That is this line of code:
```javascript
function urnSerialize(urnComponents, options) {
      const scheme = options.scheme || urnComponents.scheme || "urn";
      const nid = urnComponents.nid.toLowerCase();
```

Not sure what `nid` is, but it's `undefined` and the code does not validate, hence the unexpected exception.  Previous versions did not call `toLowerCase`.

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
const options = {
				allErrors: true,
				verbose: true,
				allowUnionTypes: true,
				schemas: {
					"/schemas/iw/rule/column/adorner": sub_columnRuleAdorner,
					"/schemas/iw/rule/column/class": sub_columnRuleClass,
					"/schemas/iw/source/command": sub_command,
					"/schemas/iw/column/computed": sub_computedColumn,
					"/schemas/iw/column/data": sub_dataColumn,
					"/schemas/iw/dateFormat": sub_dateFormat,
					"/schemas/iw/component/grid": sub_grid,
					"/schemas/iw/grid/group": sub_gridGroup,
					"/schemas/iw/component/grid/detail": sub_detailGrid,
					"/schemas/iw/source/entitySet/entityFilter": sub_entityFilter,
					"/schemas/iw/source/entitySet": sub_entitySet,
					"/schemas/iw/grid/expand": sub_expand,
					"/schemas/iw/grid/search": sub_gridSearch,
					"/schemas/iw/format": sub_format,
					"/schemas/iw/source/overlay": sub_overlay,
					"/schemas/iw/command/builtin": sub_builtinCommand,
					"/schemas/iw/command/page": sub_pageCommand,
					"/schemas/iw/command/row": sub_rowCommand,
					"/schemas/iw/rule/row/class": sub_rowRuleClass,
				},
			};
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
	"$schema": "https://json-schema.org/draft/2020-12/schema",
	"$id": "urn:pyramidsolutions.com/schemas/iw/rule/column/adorner",
	"type": "object",
	"description": "Adorner rule",
	"properties": {
		"name": {
			"type": "string",
			"description": "Name of rule used in diagnostics"
		},
		"type": {
			"type": "string",
			"description": "Type of rule 'adorner'",
			"const": "adorner"
		},
		"enabled": {
			"type": "boolean",
			"description": "Evaluate rule if set to true"
		},
		"field": {
			"type": "string",
			"description": "Field name to evaluate"
		},
		"position": {
			"type": "string",
			"description": "Adorner position",
			"enum": ["before", "after"]
		},
		"function": {
			"type": "string",
			"description": "Javascript must return formatting object(s) to trigger"
		},
		"template": {
			"type": ["number", "integer", "boolean", "string", "array", "object"],
			"description": "Data passed to the script function"
		}
	},
	"required": ["name", "type", "enabled", "field", "position", "function"]
}
```
Not sure if it is relevant.  All JSON schemas use similar techniques for `$schema` and `$id`.

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json

```

Crashes in constructor before any methods can be called.

**Your code**

<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://ajv.js.org/guide/getting-started.html
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
const ajv = new Ajv2020(options);
```

Crashes in constructor.

**Validation result, data AFTER validation, error messages**

```

```
Crashes before any methods can be called.

**What results did you expect?**
Expect it to work the same as previous version.  **Expect you to check values for `null` or `undefined` before calling methods on them.**

**Are you going to resolve the issue?**
No.