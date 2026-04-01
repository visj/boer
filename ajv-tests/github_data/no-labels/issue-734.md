# [734] oneOf null, string with non-empty pattern coerces to empty string instead of null

ajv version: 6.2.1
```
var ajvApi = require('ajv')({
	coerceTypes: true
});

var vv = ajvApi.compile({
	properties: {
		test: {
			oneOf: [{type: "null"}, { type: "string", pattern: "^M+$"}]
		}
	}
});

var data = {test: ""};
vv(data);

console.log(JSON.stringify(data.test));
```

What is expected ? `data.test === null`.