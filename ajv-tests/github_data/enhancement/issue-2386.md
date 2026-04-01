# [2386] Distinction between addVocabulary and addKeyword in the docs

**What version of Ajv you are you using?**

8.12.0

**What problem do you want to solve?**

Confusion when attempting to add keywords to ajv in strict mode. When this is explained in the [docs](https://ajv.js.org/strict-mode.html), somebody who is new may not understand the distinction between addVocabulary and addKeyword. For the newb, it may seem like one has to be added one by one, whereas the other allows you to add an entire array of keywords. 

> By default Ajv fails schema compilation when unknown keywords are used. Users can explicitly define the keywords that should be allowed and ignored:

```
ajv.addKeyword("allowedKeyword")
```

> or

```
ajv.addVocabulary(["allowed1", "allowed2"])
```

Making this distinction more clear can avoid needless frustration and make ajv more friendly to users.

**What do you think is the correct solution to problem?**

I would add:

> By default Ajv fails schema compilation when unknown keywords are used. Users can explicitly define the keywords that should be allowed and ignored:

```
ajv.addVocabulary(["allowed1", "allowed2"]) // to add from ajv.keywords library
```

>or 

```
ajv.addKeyword("allowedKeyword") // to add a user-defined keyword
```

For more information on vocabulary that can be added to ajv, refer to [ajv.keywords](https://github.com/ajv-validator/ajv-keywords).

**Will you be able to implement it?**

No, the [link](https://github.com/ajv-validator/ajv/blob/master/docs/packages/ajv-keywords) in github is dead
But I could, it is just a quick change to HTML or Markdown.