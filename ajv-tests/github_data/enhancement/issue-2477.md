# [2477] `regexp` should be wrapped in try/catchs

**What version of Ajv you are you using?**
8.17.1

**What problem do you want to solve?**
Tracking down invalid regex.

**What do you think is the correct solution to problem?**
An invalid regex in the schema (in my case `^[0-9]{2-4}`) throws an error without any indication where in the schema or what pattern failed. When you have a large schema this makes it difficult to track down exactly where the bad pattern is. There's a [todo in the code](https://github.com/ajv-validator/ajv/blob/9050ba1359fb87cd7c143f3c79513ea7624ea443/lib/vocabularies/validation/pattern.ts#L21) about this.

This can be somewhat mitigated by use the `regExp` option.

```
new Ajv({
  code: {
    regExp: (pattern: string, u: string) => {
      try {
        return new RegExp(pattern, u)
      } catch (e) {
        console.error('Bad RegExp: ', pattern, e)
      }
    },
  }
})
```

However this only displays the bad pattern not where in the schema it's used.

**Will you be able to implement it?**
No.
