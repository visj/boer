# [1295] Error: unknown format "date-time" ignored in schema at path "#/properties/timestamp"

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.12.5


**JSON Schema**

```
https://uniswap.org/tokenlist.schema.json

```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```
"timestamp": "2018-11-13T20:20:39+00:00"

```


**Your code**

```
export const generateMyTokenList = (tokenList: TokenList) => {
    // Your list
    const myList = tokenList;
    // Creating a new Ajv object
    const validator = new Ajv();
    // Validating if the scheme is a valid scheme
    const validateScheme = validator.validateSchema(schema);
    console.log('validateScheme', validateScheme)
    // If the validateScheme returns true it is a valid scheme than validate my list
    if(validateScheme) {
        let validatedList = validator.validate(schema, myList); 
        console.log('validatedList', validatedList)
    }
}

```


**Validation result, data AFTER validation, error messages**

```
Error: unknown format "date-time" ignored in schema at path "#/properties/timestamp"

```

**What results did you expect?**
I am having this trouble also for 'URI'. My question is why is AJV ignoring all the formats? i am using
