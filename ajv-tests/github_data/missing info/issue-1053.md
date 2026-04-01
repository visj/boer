# [1053] Invalid result of validate function and no errors!

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.10.2

**Ajv options object**
`{ schemaId: 'auto' }`

**Your code**
```
            ...
            this.validateFunction = this.validator.addSchema(schemas).compile(mainSchema);
            const valid: boolean | PromiseLike<any> = this.validateFunction(invoiceSchema);
            console.log('Errors:', this.validator.errorsText(this.validator.errors)); **_// returns "no errors"_**
            console.log('Valid:', valid); **_// returns false_**
```