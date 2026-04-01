# [2468] Getting "Invalid regular expression /<myRegex>/" error while compiling

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Ajv version: 8.16.0

**Ajv options object**
```
    const ajv = new Ajv({ allErrors: true })
```

**JSON Schema**
```
    const schema: JSONSchemaType<jsonBodyType> = {
      "type": "object",
      "properties": {
        "description": {
          "type": "string",
          "pattern": /^{(\\"[a-zA-Z]+\\":\\"[a-zA-Z0-9/_,. &|$#*?\\n():%'!-]+\\")(,\\"[a-zA-Z]+\\":\\"[a-zA-Z0-9/_,. &|$#*?\\n():%'!-]+\\")*}$/.toString().slice(1, -1)
        },
      },
      "required": ["description"],
    }
```

**Sample data**
```
    {"description":"{\"en\":\"Unlock Samsung devices effortlessly with our FRP removal service. Bypass factory reset protection on the 
    latest models and Android versions. Take back control of your device now!\\n\\nQuickly check if your device is supported\"}"}
```

**Your code**
```
    const validate = ajv.compile(schema);
    validate(data);
```

**Validation result, data AFTER validation, error messages**
```
    node_modules\ajv\dist\core.js (23:38) @ defaultRegExp ⨯ SyntaxError: Invalid regular expression: /^{(\\"[a-zA-Z]+\\":\\"[a-zA-Z0- 
    9/_,. &|$#*?\\n():%'!-]+\\")(,\\"[a-zA-Z]+\\":\\"[a-zA-Z0-9/_,. &|$#*?\\n():%'!-]+\\")*}$/u: Lone quantifier brackets
```
![image](https://github.com/ajv-validator/ajv/assets/79903897/1d0e5b3b-32c2-4430-8a66-6b07924c4453)

**What results did you expect?**
I expected the regex to be valid and the data to match it like in the RegExr website
![image](https://github.com/ajv-validator/ajv/assets/79903897/d1f3e5d5-5f6c-4f99-b725-d78d6c187668)


**Are you going to resolve the issue?**
I don't know yet, I hope the ajv team resolves it