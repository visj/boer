# [1305] Unable to enforce schema validity using `meta` schema option...

hi there :wave:

thanks to all the maintainers for the hard work you do :pray::heart:

i'm trying to figure out how to safely validate user-provided schemas. to that end, i thought i might be able to set a single, custom meta-schema which removes support for dangerous / unwanted formats and keywords. unfortunately, i can't seem to figure out how to get things working as i expect - specifically, `ajv.addSchema()` doesn't ever seem to throw.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
`v6.12.6`, yes

**Ajv options object**

```javascript
{
	meta: false,
	allErrors: true,
	useDefaults: true,
	extendRefs: 'fail',
	missingRefs: 'fail',
	strictNumbers: true,
	strictDefaults: true,
	strictKeywords: true,
	unknownFormats: true,
	validateSchema: true,
	removeAdditional: 'all'
}

```

**JSON Meta Schema**

```json
{
    "$schema": "http://my.custom/schema#",
    "$id": "http://my.custom/schema#",
    "properties": {
        "myKeyword": { "type": "boolean" }
    }
}
```


**JSON Schema**

```json
{
    "properties": {
        "myUnknownKeyword": { "type": "boolean" }
    }
}
```


**Your code**

```javascript
const ajv = new AJV({
    meta: false,
    allErrors: true,
    useDefaults: true,
    extendRefs: 'fail',
    missingRefs: 'fail',
    strictNumbers: true,
    strictDefaults: true,
    strictKeywords: true,
    unknownFormats: true,
    validateSchema: true,
    removeAdditional: 'all',
});

ajv.addMetaSchema({
    $schema: 'http://my.custom/schema#',
    $id: 'http://my.custom/schema#',
    properties: {
        myKeyword: { type: 'boolean' }
    }
});

try {
    // i'd expect this to be considered `invalid` given my meta-schema
    ajv.addSchema({
        properties: {
            myUnknownKeyword: { type: 'boolean' }
        }
    });
} catch (error){
    console.log('this should throw');
    console.error(error);
}
```

**What results did you expect?**
i expected the call to `ajv.addSchema()` to throw an error due to my schema being invalid as defined by my meta-schema

**What were the actual results**
no error is thrown, message - `meta-schema not available` - is logged to the console
