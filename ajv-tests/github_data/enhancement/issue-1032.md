# [1032] Custom. Overload (reuse) present handlers

In example - I'd prefer to extend $ref for uri-reference in my project.
Something like
```javascript
const originalRef = ajv.getKeyword($ref)
ajv.addKeyword('$ref', Object.assign({}, originalRef, {
   inline: function (it, keyword, schema) {
     if (!it.startsWith('.'))
       return originalRef.inline(...arguments)
    // Custom scope
  }
}))
```


**What version of Ajv you are you using?**
ajv-cli latest
**What problem do you want to solve?**
Raise reuse, solve conflict with Microsoft VS Code validator
**What do you think is the correct solution to problem?**
Add method avj.getKeyword
**Will you be able to implement it?**
yes i hope