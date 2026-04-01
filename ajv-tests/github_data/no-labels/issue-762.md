# [762] Uncaught Error: Cannot find module "./refs/json-schema-draft-07.json"

 ajv verision I used was "^6.4.0"


I import ajv
```javascript
import Ajv from 'ajv';
```

and I use it in function, but I have error when I new Ajv()
```javascript
const ajv = new Ajv({ allErrors: true });
```
it shows `Uncaught Error: Cannot find module "./refs/json-schema-draft-07.json"`

error msg screen shot
 ![error msg screen shot](https://i.imgur.com/bE1NkZT.png)

I already npm install ajv. Why does it happen.

draft-07 exists
![draft-07](https://i.imgur.com/tSlXQ6u.png)

Does I do something wrong? I can use it when I use `new Ajv({meta: false });` before. But it can't works now even I use `new Ajv({meta: false, allErrors: true  });`. I don't know why.

Please help me. Thanks a lot.
