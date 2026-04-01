# [1539] Add the keyword name to the reported error message in internal validation (validateKeywordUsage)

**What version of Ajv you are you using?**
8.0.5

**What problem do you want to solve?**
If the keyword is malformed according to the keyword schema definition, the current message that `ajv` throws is as follows (as an example):
```
 keyword value is invalid: data must be object
```

It's really annoying to try to track down _which_ specific keyword definition is malformed at this point, especially if we have multiple schemas precompiled one after another, and/or they are not overly simple.

**What do you think is the correct solution to problem?**
Add the keyword name to the message

```
 keyword 'foo' value is invalid: data must be object
```

or

```
 keyword 'foo': keyword value is invalid: data must be object
```

**Will you be able to implement it?**

Sure. For this particular change, we only have to change this:
https://github.com/ajv-validator/ajv/blob/b5642ea8655c3922de7f2403cc99d668871d35fb/lib/compile/validate/keyword.ts#L164

into:
```typescript
const msg = "keyword '" + keyword + "' value is invalid: " + self.errorsText(def.validateSchema.errors)
```

or

```typescript
const msg = "keyword '" + keyword + "': keyword value is invalid: " + self.errorsText(def.validateSchema.errors)
```

On the other hand, there might be more places that could use a little bit more verbose error reporting, so I'm open to extra suggestions.