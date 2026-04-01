# [1665] Warning: these parameters are deprecated, see docs for addKeyword

I get this message when I initialize ajv, my code looks like this:

```
import Ajv from 'ajv-draft-04';
import AjvBson from 'ajv-bsontype';
import AjvErrors from 'ajv-errors';

const ajv = new Ajv({ allErrors: true, strictTypes: false });
AjvBson(ajv);
AjvErrors(ajv);
```

I am using 

ajv 8.6.0
ajv-bsontype 1.0.7
ajv-draft-04 1.0.0
ajv-errors 3.0.0