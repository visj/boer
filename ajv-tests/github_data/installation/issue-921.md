# [921] Cannot find module './_limit'



**What version of Ajv are you using? Does the issue happen if you use the latest version?**
My version of Ajv is 6.7.0.

In file node_modules/ajv/lib/dotjs/index.js

```javascript
  maximum: require('./_limit'),
  minimum: require('./_limit'),
```

but there is no _limit.js

so I had a error: (node:34683) UnhandledPromiseRejectionWarning: Error: Cannot find module './_limit'

