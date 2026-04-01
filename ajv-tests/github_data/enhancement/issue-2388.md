# [2388] Toss a Warning instead of throwing an error when adding a keyword

**What version of Ajv you are you using?**
8.12.0

**What problem do you want to solve?**

When attempting to test the same piece of data as part of multiple tests in unit testing, throwing an error and refusing to continue until the tester renames the keys every time one wants to test the same data. 

**What do you think is the correct solution to problem?**

TL:DR = Toss a warning instead of throwing an error.

Adding the same '{key:value}' pair to an object as part of `addKeyword` seem drastic. If the keyword is removed in one place (ie. key: false) and then added to be used again (ie. key: true). I may not understand why this precaution is being taken, I searched for an answer but could not find one.

**Will you be able to implement it?**

Unless there are reasons not to.

`node_modules/ajv/dist/core.js`

`line 525`

```
const KEYWORD_NAME = /^[a-z_$][a-z0-9_$:-]*$/i;
function checkKeyword(keyword, def) {
    const { RULES } = this;
    (0, util_1.eachItem)(keyword, (kwd) => {
        if (RULES.keywords[kwd])
            this.logger.warn(`Keyword ${kwd} is already defined`); // A warning rather than an error
        if (!KEYWORD_NAME.test(kwd))
            throw new Error(`Keyword ${kwd} has invalid name`);
    });
    if (!def)
        return;
    if (def.$data && !("code" in def || "validate" in def)) {
        throw new Error('$data keyword must have "code" or "validate" function');
    }
}
```
