# [1392] `strict: true` should enable all strict mode options (aka, be like typescript)

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/docs/faq.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv you are you using?**
v7

**What problem do you want to solve?**
Whenever I enable strict mode I always pass `strict: true`, only to then remember that that doesn't do anything, as I've got to actually set two other properties to `true`.

**What do you think is the correct solution to problem?**
When I do `strict: true`, use that as the default for all strict-mode options - that way all strict-mode options will be enabled when I pass `strict: true` while allowing me to turn off the ones I don't want by explicitly setting them to `false` or `log`.

This is the behaviour I've come to expect from having worked with TypeScript for so long, as it's `strict` mode is pretty much the same as ajvs.

**Will you be able to implement it?**
Yes :)