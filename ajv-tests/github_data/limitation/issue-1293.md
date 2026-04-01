# [1293] Fragments maintain cache-like behaviour, which is never cleared 

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.12.4


**Ajv options object**

<!-- See https://github.com/ajv-validator/ajv#options -->

```javascript
{useDefaults: true}
```


**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/ajv-validator/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
test.only('Should allow removing and adding "nested" schemas', t => {
    
    const SOME_TYPE = 'SomeType'
    const SOME_STRING = 'some string'
    const SOME_NUMBER = 5

    const ajv = aJV({useDefaults: true})

    // Add initial schema (supports a string)
    ajv.addSchema({[SOME_TYPE]: STRING_SCHEMA}, 'data')
    const validate = ajv.getSchema(`data#/${SOME_TYPE}`)
    t.deepEqual(validate(SOME_STRING), true) // Works of course

    // Replace schema with new one (supports a number) 
    ajv.removeSchema('data')
    ajv.addSchema({[SOME_TYPE]: NUMBER_SCHEMA}, 'data')

    // Returns a cached validator due to fragments
    const validate2 = ajv.getSchema(`data#/${SOME_TYPE}`)
    t.deepEqual(validate2(SOME_NUMBER), true) // Breaks - expects a string
    t.deepEqual(validate2(SOME_STRING), false)
})

```

**Why does this happen ? 
In some cases a fragments object is populated - 
https://github.com/ajv-validator/ajv/blob/master/lib/ajv.js#L218 

This object is not cleared when calling `removeSchema` (unlike `_refs` &  `_schemas `)
https://github.com/ajv-validator/ajv/blob/master/lib/ajv.js#L262


**What results did you expect?**
- Removing and adding a schema under a certain namespace should be supported, and validation should run for updated schema. 

**Are you going to resolve the issue?**

- This can be resolved by clearing all keys matching schema key provided in removeSchema. 