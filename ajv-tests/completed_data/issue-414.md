# [414] it.util.cleanUpVarErrors is not a function

**it.util.cleanUpVarErrors is not a function**

Ajv 5.0.1-beta.3

I get this error when calling `addMetaSchema` with the v4 schema:
```javascript
    import Ajv from 'ajv/lib/ajv.js';
    import metaSchema from 'ajv/lib/refs/json-schema-draft-04.json';

    const ajv = new Ajv({
      meta: false,
      extendRefs: true,
      unknownFormats: 'ignore', 
    });
    
    ajv.addMetaSchema(metaSchema); // Throws the error
```

This is how `it.util` looks like in the chrome developer tools:
![chrome_2017-02-14_00-10-26](https://cloud.githubusercontent.com/assets/3287937/22905721/026efc4a-f24a-11e6-875a-6622d18860e2.png)


What can be the problem?