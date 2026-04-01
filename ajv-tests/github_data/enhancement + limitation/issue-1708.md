# [1708] A `schemaType` of `integer` doesn't seem to work correctly with custom keyword

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.6.2


**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{
    strict: true,
    allErrors: true,
    logger: console,
    loadSchema: () => {},
}
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    "myBadKeyword": 5,
}
```



**Your code**


```javascript
const Ajv = require('ajv');

async function testIt() {
  const ajvOptions = {
    strict: true,
    allErrors: true,
    logger: console,
    loadSchema: () => {},
  };

  const ajv = new Ajv(ajvOptions);
  ajv.addKeyword({
    keyword: 'myBadKeyword',
    schemaType: 'integer',
  });

  ajv.addKeyword({
    keyword: 'myGoodKeyword',
    schemaType: 'number',
  });

  const myBadSchema = {
    myBadKeyword: 5,
  };

  const myGoodSchema = {
    myGoodKeyword: 5,
  };

  try {
    await ajv.compileAsync(myBadSchema);
    console.log('bad schema compiled without exception');
  } catch (e) {
    console.log(e);
  }

  try {
    await ajv.compileAsync(myGoodSchema);
    console.log('good schema compiled without exception');
  } catch (e) {
    console.log(e);
  }
}

testIt().then(console.log('done'));
```

Output:

```bash
✗ node test.js
done
Error: myBadKeyword value must be ["integer"]
    at new KeywordCxt (/Users/cwelchmi/repos/metasys-rest-api/node_modules/ajv/dist/compile/validate/index.js:298:23)
    at keywordCode (/Users/cwelchmi/repos/metasys-rest-api/node_modules/ajv/dist/compile/validate/index.js:449:17)
    at /Users/cwelchmi/repos/metasys-rest-api/node_modules/ajv/dist/compile/validate/index.js:222:17
    at CodeGen.code (/Users/cwelchmi/repos/metasys-rest-api/node_modules/ajv/dist/compile/codegen/index.js:439:13)
    at CodeGen.block (/Users/cwelchmi/repos/metasys-rest-api/node_modules/ajv/dist/compile/codegen/index.js:568:18)
    at iterateKeywords (/Users/cwelchmi/repos/metasys-rest-api/node_modules/ajv/dist/compile/validate/index.js:219:9)
    at groupKeywords (/Users/cwelchmi/repos/metasys-rest-api/node_modules/ajv/dist/compile/validate/index.js:208:13)
    at /Users/cwelchmi/repos/metasys-rest-api/node_modules/ajv/dist/compile/validate/index.js:192:13
    at CodeGen.code (/Users/cwelchmi/repos/metasys-rest-api/node_modules/ajv/dist/compile/codegen/index.js:439:13)
    at CodeGen.block (/Users/cwelchmi/repos/metasys-rest-api/node_modules/ajv/dist/compile/codegen/index.js:568:18)
good schema compiled without exception
```

**Validation result, data AFTER validation, error messages**

Compiling the good schema with a custom keyword using `schemaType` of `number` works fine. Compiling the bad schema with a custom keyword using `schemaType` of `integer` throws an exception even though the data in the schema is an integer.

**What results did you expect?**

I expected that I could use `schemaType` of integer in this case.

**Are you going to resolve the issue?**

I just started looking into the issue. Not familiar with the code base, so I'm not sure.
