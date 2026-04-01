# [1366] Option allowUnionTypes is ignored

Hello,

since I made the update to the latest version of ajv, I get the following warning in the browser, even if I set the appropriate options.

```javascript
strict mode: use allowUnionTypes to allow union type keyword at "#/definitions/etpSetter/properties/value" (strictTypes)
```

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Version: 7.0.2
Happens with latest version: yes

**Ajv options object**

```javascript
{strict: false, allowUnionTypes: true}
```

Is this a bug or am I making some kind of mistake here?
Thanks in advance.