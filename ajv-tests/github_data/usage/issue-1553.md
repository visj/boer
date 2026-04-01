# [1553] strict mode: missing type "object" for keyword "required" at "#" (strictTypes)

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.1

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
    const ajv = new Ajv({ allErrors: true })
```

**JSON Schema**

Its a small extraction  - I have left out the full properties..

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
      required: ["PoolConfig"],
      properties: {
        PoolConfig: {
          type: "object",
          required: [
            "address",
            "coinbaseString",

```

The error that is displayed is

```
strict mode: missing type "object" for keyword "required" at "#" (strictTypes)
```

It doesn't stop it from working.

But the "required" is there, I should not disable strict mode, right ?
