# [1136] Add keywords option

Add the `keywords` option to the Ajv options to add custom keywords, without having to call `addKeyword`.

**What version of Ajv you are you using?**
6.10.2

**What problem do you want to solve?**
Add keywords object directly to the Ajv constructor, like formats.

```js
new Ajv({
  keywords: {
    constant: {
      validate: function (schema, data) {
        return true;
      }
    }
  }
});
```

**What do you think is the correct solution to problem?**
Copy the implementation of the `formats` option to add keywords.

**Will you be able to implement it?**
yes