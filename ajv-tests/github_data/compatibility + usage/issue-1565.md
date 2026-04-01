# [1565] Chrome extension manifest v3 support

ajv.compile() failing with following error

```

EvalError: Refused to evaluate a string as JavaScript because 'unsafe-eval' is not an allowed source of script in the following Content Security Policy directive: "script-src 'self'".

    at new Function (<anonymous>)
    at Ajv.compileSchema (index.js:88)
    at Ajv.inlineOrCompile (index.js:146)
    at Ajv.resolveRef (index.js:140)
    at Object.code (ref.js:20)
    at Object.keywordCode (keyword.js:12)
    at iterate.js:16
    at CodeGen.code (index.js:438)
    at CodeGen.block (index.js:567)
    at Object.schemaKeywords (iterate.js:16)

```

<img width="729" alt="Screenshot 2021-04-24 at 12 11 01 PM" src="https://user-images.githubusercontent.com/63744048/115950265-d4dc0b00-a4f7-11eb-9cc6-cd158826d688.png">
