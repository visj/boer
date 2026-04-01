# [883] Custom keyword: number type keyword is called twice, but string type keyword is OK.

**Question**
I use 6.3.3, and latest version(6.5.5) get the same issue.

**Ajv options object**

```javascript
{
  allErrors: true,
  removeAdditional: false
}

```


**JSON Schema**

```js
{
  type: 'object',
  properties: {
    longitude: {
      type: 'number',
      coreFormat: 'longitude'
    }
  }
}
```

**Sample data**
```js
{
  longitude: -200
}
```

**My code**

```javascript
const Ajv = require('ajv');

function validationFn(data) {
	validationFn.errors = [];
	validationFn.errors.push({
		message: "must match format 'longtitude', e.g. 85.5",
	});

	return data >= -180 && data <= 180;
};

const coreFormat = {
	name: 'coreFormat',
	def: {
		type: ['number', 'integer', 'string', 'boolean', 'array', 'object'],
		modifying: true,
		errors: true,
		compile: function(schema) { // schema: longitude, email ...
			return validationFn;
		},
	},
	metaSchema: {
		type: 'string',
	},
};

const ajv = new Ajv({
	allErrors: true,
	removeAdditional: false
});
ajv.addKeyword(coreFormat.name, coreFormat.def);

const valid = ajv.validate({
	type: 'object',
	properties: {
		longitude: {
			type: 'number',
			coreFormat: 'longitude'
		}
	}
}, {
	longitude: -200
});

if (!valid) {
	console.log(ajv.errors);
}

```


**Validation result, data AFTER validation, error messages**

```
[ { message: 'must match format \'longtitude\', e.g. 85.5',
    dataPath: '.longitude',
    schemaPath: '#/properties/longitude/coreFormat' },
  { message: 'must match format \'longtitude\', e.g. 85.5',
    dataPath: '.longitude',
    schemaPath: '#/properties/longitude/coreFormat' } ]

```

**The results I expect**
```
[ { message: 'must match format \'longtitude\', e.g. 85.5',
    dataPath: '.longitude',
    schemaPath: '#/properties/longitude/coreFormat' } ]
```
