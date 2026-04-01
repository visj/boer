# [948] Arbitrary property name on first level

Hello!

I would like to ask a question about json-schema itself and how ajv maybe already manage that please.

**JSON Schema**

I need to use on first level of my object description an arbitrary property name, that could be latin letters for example. I'm using already patternPropererties keyword on some other objects but on first level, I really don't know to achieve it. It should give something like this:

```json
        "^[A-Za-z]+$": {
          type: 'object'
        }
```

I hope my explanation is correct and really look forward on a way to do this and be validated.

Thanks!
