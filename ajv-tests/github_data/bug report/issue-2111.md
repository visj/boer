# [2111] Cannot import Ajv

when I import Ajv in typescript
```ts
import Ajv from 'ajv/dist/ajv.js';
```

chrome return this error
```
Uncaught SyntaxError: The requested module './../../node_modules/ajv/dist/ajv.js' does not provide an export named 'default' (at validator.ts:1:8)
```

why does this issue happen?

thanks