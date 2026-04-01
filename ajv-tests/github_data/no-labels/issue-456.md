# [456] Complex array schema validation.  Better error messages desired.

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- browser/compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

4.11.3

**Ajv options object (see https://github.com/epoberezkin/ajv#options):**

```javascript

see code below.  Default out of the box otherwise.

```


**JSON Schema (please make it as small as possible to reproduce the issue):**

```json
	"@geoSystem": {
			"description": "Attempts to validate all possible combinations",
			"oneOf": [
				{
					"type": "array",
					"minItems": 1,
					"maxItems": 3,
					"items": [
						{
							"type": "string",
							"enum": [
								"GD",
								"GDC"
							],
							"default": "GD"
						},
						{
							"type": "string",
							"enum": [
								"AM",
								"AN",
								"BN",
								"BR",
								"CC",
								"CD",
								"EA",
								"EB",
								"EC",
								"ED",
								"EE",
								"EF",
								"FA",
								"HE",
								"HO",
								"ID",
								"IN",
								"KA",
								"RF",
								"SA",
								"WD",
								"WE"
							],
							"default": "WE"
						}
					],
					"additionalItems": {
						"type": "string",
						"enum": [
							"WGS84"
						]
					}
				},
				{
					"type": "array",
					"minItems": 1,
					"maxItems": 5,
					"items": [
						{
							"type": "string",
							"enum": [
								"UTM"
							],
							"default": "GD"
						},
						{
							"type": "string",
							"enum": [
								"Z01",
								"Z1",
								"Z02",
								"Z2",
								"Z03",
								"Z3",
								"Z04",
								"Z4",
								"Z05",
								"Z5",
								"Z06",
								"Z6",
								"Z07",
								"Z7",
								"Z08",
								"Z8",
								"Z09",
								"Z9",
								"Z10",
								"Z11",
								"Z12",
								"Z13",
								"Z14",
								"Z15",
								"Z16",
								"Z17",
								"Z18",
								"Z19",
								"Z20",
								"Z21",
								"Z22",
								"Z23",
								"Z24",
								"Z25",
								"Z26",
								"Z27",
								"Z28",
								"Z29",
								"Z30",
								"Z31",
								"Z32",
								"Z33",
								"Z34",
								"Z35",
								"Z36",
								"Z37",
								"Z38",
								"Z39",
								"Z40",
								"Z41",
								"Z42",
								"Z43",
								"Z44",
								"Z45",
								"Z46",
								"Z47",
								"Z48",
								"Z49",
								"Z50",
								"Z51",
								"Z52",
								"Z53",
								"Z54",
								"Z55",
								"Z56",
								"Z57",
								"Z58",
								"Z59",
								"Z60"
							],
							"default": "WE"
						},
						{
							"type": "string",
							"enum": [
								"S"
							]
						},
						{
							"type": "string",
							"enum": [
								"AM",
								"AN",
								"BN",
								"BR",
								"CC",
								"CD",
								"EA",
								"EB",
								"EC",
								"ED",
								"EE",
								"EF",
								"FA",
								"HE",
								"HO",
								"ID",
								"IN",
								"KA",
								"RF",
								"SA",
								"WD",
								"WE"
							]
						}
					],
					"additionalItems": {
						"type": "string",
						"enum": [
							"WGS84"
						]
					}
				},
				{
					"type": "array",
					"minItems": 1,
					"maxItems": 1,
					"items": [
						{
							"type": "string",
							"enum": [
								"GC",
								"GCC"
							]
						}
					],
					"additionalItems": false
				}
			]
		},


```


**Data (please make it as small as posssible to reproduce the issue):**

// note, it may fail because N is not present in schema.  But look at the errors produced.
```json

 "@geoSystem":["UTM","Z10","N"],

```


**Your code (please use `options`, `schema` and `data` as variables):**

```javascript
var validate = {};

var Ajv = require('ajv');

function setVersion(version) {
        var versions = { "3.0":true,"3.1":true,"3.2":true,"3.3":true,"3.4":true,
 "4.0":true }
        if (!versions[version]) {
                console.error("Can only validate version 3.0-4.0 presently. Swit
ching version to 3.3.");
                version = "3.3";
        }
        if (!validate[version]) {
                var schema = fs.readFileSync("x3d-"+version+"-JSONSchema.json").
toString();
                var ajv = new Ajv({ allErrors:true});
                ajv.addFormat("uri", /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-
z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?
:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4
}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f
]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a
-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{
1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?
:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6
}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2
[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@\/?]|%[0-9a-f]{2})*)?(?:\#(?:[a-z0-9\-._~!$&'()*+,;=:@\/?]|%[0-9a-f]{2})*)?$/i);
                validate[version] = ajv.compile(JSON.parse(schema));
        }
        return version;
}


                        var json = jsonlint.parse(str);
                        var version = json.X3D["@version"];
                        version = setVersion(version);  // loads schema.
                        var valid = validate[version](json);
                        if (!valid) {
                                var errs = validate[version].errors;
                                var error = ""
                                for (var e in errs) {
                                        error += "\r\n dataPath: " + errs[e].dataPath + "\r\n";
                                        error += " message: " + errs[e].message + "\r\n";
                                        error += " params: " + JSON.stringify(errs[e].params) + "\r\n";
                                }
                                throw error;
                        }


```

<!--
It would help if you post a working code sample in Tonic notebook and include the link here. You can clone this notebook: https://tonicdev.com/esp/ajv-issue.
-->


**Validation result, data AFTER validation, error messages:**

```
 dataPath: .X3D.Scene['-children'][4].GeoViewpoint['@geoSystem'][0]
 message: should be equal to one of the allowed values
 params: {"allowedValues":["GD","GDC"]}

 dataPath: .X3D.Scene['-children'][4].GeoViewpoint['@geoSystem'][1]
 message: should be equal to one of the allowed values
 params: {"allowedValues":["AM","AN","BN","BR","CC","CD","EA","EB","EC","ED","EE","EF","FA","HE","HO","ID","IN","KA","RF","SA","WD","WE"]}

 dataPath: .X3D.Scene['-children'][4].GeoViewpoint['@geoSystem'][2]
 message: should be equal to one of the allowed values
 params: {"allowedValues":["WGS84"]}

 dataPath: .X3D.Scene['-children'][4].GeoViewpoint['@geoSystem'][2]
 message: should be equal to one of the allowed values
 params: {"allowedValues":["S"]}

 dataPath: .X3D.Scene['-children'][4].GeoViewpoint['@geoSystem']
 message: should NOT have more than 1 items
 params: {"limit":1}

 dataPath: .X3D.Scene['-children'][4].GeoViewpoint['@geoSystem']
 message: should NOT have more than 1 items
 params: {"limit":1}

 dataPath: .X3D.Scene['-children'][4].GeoViewpoint['@geoSystem'][0]
 message: should be equal to one of the allowed values
 params: {"allowedValues":["GC","GCC"]}

 dataPath: .X3D.Scene['-children'][4].GeoViewpoint['@geoSystem']
 message: should match exactly one schema in oneOf
 params: {}



```

**What results did you expect?**

Validation success.

**Are you going to resolve the issue?**

May try to alter schema.  Will try adding "N" to list.  Will report back.
