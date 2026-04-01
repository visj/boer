# [957] Allow easy detection of ignored `default` keywords in schemas

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv you are you using?**

6.9.1

**What problem do you want to solve?**

When using ajv with `useDefaults: true`, the `default` keyword is ignored in some cases, as documented in the readme. If someone is aware of the existence of the `default` keyword but isn't familiar with the details of where it can be used, they might inadvertently use it in a place where it's ignored, resulting in a buggy schema. (This recently caused some bugs in ESLint rules -- also see https://github.com/eslint/eslint/pull/11427.)

We'd like to detect this problem so that schema authors can fix the issue. As far as I can tell, there isn't a simple way for an external tool to figure out whether an ignored `default` keyword exists in a user-provided schema, without reimplementing some of the logic from `ajv`.

**What do you think is the correct solution to problem?**

It should be possible to opt into a mode where invalid `default` keywords result in a compilation or validation error, rather than being ignored. It seems like this could in principle be added to the meta-schema, although it could make the meta-schema substantially larger. Another possibility could be to add an option to the `Ajv` constructor that causes this case to throw an error.

**Will you be able to implement it?**

I'm willing to give it a shot if there is agreement that this is worthwhile.