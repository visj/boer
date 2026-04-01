# [568] Ajv.ValidationError type is not defined for TypeScript

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
5.2.2, Yes

```javascript

if ( err instanceof Ajv.ValidationError ) { ... }

```
Error I receive: 

Property 'ValidationError' does not exist on type '{ (options?: Options | undefined): Ajv; new (options?: Options | undefined): Ajv; }'.


