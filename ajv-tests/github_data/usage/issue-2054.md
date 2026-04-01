# [2054] patternProperties reports invalid expression `Lone quantifier brackets` for escaped, and other seemingly valid, expression

Ajv version 8.11.0

The javascript:
```javascript
let ajv = new Ajv({ strict: false });
addFormats(ajv);
const validate = ajv.addSchema([ openapischema ]).compile(apixpschema);
console.log(JSON.stringify(validate(data)));
validate(data);
return validate;
```

The schema (vastly simplified for example):
```json
{
	"type": "object",
	"patternProperties": {
		"^\\\/(?!-)(?:[a-zA-Z0-9-]+|{\\w+})(?<!-)(?:\\\/(?!-)(?:[a-zA-Z0-9-]+|{\\w+})(?<!-))*(\\\/(?!-\\.)[a-zA-Z0-9-\\.]+(?<!-\\.))?$": {
			"type": "object"
		}
	}, "additionalProperties": false
}
```

The data (simplified) to validate:
```json
{ "/test/{testpatharg}/test": {} }
```

Proof that the regex works: https://regex101.com/r/1nMc3V/1

There is quite a bit of escaping in the regex so I do use this online resource to help me escape properly: https://www.freeformatter.com/json-escape.html#before-output

The (unexpected and confounding) syntax error:
```
SyntaxError: Invalid regular expression: /^\/(?!-)(?:[a-zA-Z0-9-]+|{\w+})(?<!-)(?:\/(?!-)(?:[a-zA-Z0-9-]+|{\w+})(?<!-))*(\/(?!-\.)[a-zA-Z0-9-\.]+(?<!-\.))?$/: Lone quantifier brackets
    at new RegExp (<anonymous>)
    at defaultRegExp (/home/rein/git/rebelstack/apixp/node_modules/ajv/dist/core.js:23:39)
    at usePattern (/home/rein/git/rebelstack/apixp/node_modules/ajv/dist/vocabularies/code.js:73:16)
    at /home/rein/git/rebelstack/apixp/node_modules/ajv/dist/vocabularies/applicator/additionalProperties.js:53:127
    at Array.map (<anonymous>)
    at isAdditional (/home/rein/git/rebelstack/apixp/node_modules/ajv/dist/vocabularies/applicator/additionalProperties.js:53:74)
    at /home/rein/git/rebelstack/apixp/node_modules/ajv/dist/vocabularies/applicator/additionalProperties.js:36:28
    at /home/rein/git/rebelstack/apixp/node_modules/ajv/dist/compile/codegen/index.js:519:71
    at CodeGen.code (/home/rein/git/rebelstack/apixp/node_modules/ajv/dist/compile/codegen/index.js:439:13)
    at CodeGen._for (/home/rein/git/rebelstack/apixp/node_modules/ajv/dist/compile/codegen/index.js:488:18)
```