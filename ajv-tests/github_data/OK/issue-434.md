# [434] Non-latin domains in emails

In https://github.com/epoberezkin/ajv/blob/master/lib/compile/formats.js
```
email: /^[a-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i,
```
But what about non-latin domains from рф and other ?

For example, commons-validator-js supports them: https://github.com/wix/commons-validator-js/blob/master/src/Domains.js
