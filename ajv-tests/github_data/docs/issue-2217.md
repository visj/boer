# [2217] Docs: addKeyword argument

**What version of Ajv you are you using?**
8.11.2

**What is the problem**

[The docs](https://ajv.js.org/api.html#ajv-addkeyword-definition-string-object-ajv) are missing, that `":"` also is an allowed non-leading character in custom keywords added via `addKeyword()`. It probably also is worth mentioning, that *letter* means an ASCII letter.

RegEx for ref: `/^[a-z_$][a-z0-9_$:-]*$/i` at [Line](https://github.com/ajv-validator/ajv/blob/b3e0cb17d0e095b5c883042b2306571be5ec86b7/lib/core.ts#L819)
