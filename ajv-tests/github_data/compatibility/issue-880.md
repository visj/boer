# [880] Problem with serialize option.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.5.5

**Ajv options object**
```javascript
{allErrors: true, schemaId: 'auto'}
```

**Your code**

```javascript
import * as Ajv from 'ajv';
...
    componentDidMount() {
        this.validator = new Ajv({allErrors: true, schemaId: 'auto'});
    }
...
```


**Validation result, data AFTER validation, error messages**

```
ajv.js:300 Uncaught (in promise) TypeError: serialize is not a function
    at Ajv._addSchema (ajv.js:300)
    at Ajv.addSchema (ajv.js:136)
    at Ajv.addMetaSchema (ajv.js:151)
    at addDraft6MetaSchema (ajv.js:455)
    at new Ajv (ajv.js:73)
    at Page.componentDidMount (Page.tsx:82)
    at CallbackQueue.notifyAll (react.min.js:869)
    at ReactReconcileTransaction.close (react.min.js:12870)
    at ReactReconcileTransaction.closeAll (react.min.js:15699)
    at ReactReconcileTransaction.perform (react.min.js:15646)
```

**What results did you expect?**
Want to able to initiate Ajv instanse.

Second problem:
I tried to use `new Ajv({allErrors: true, serialize: false, schemaId: 'auto'})` .
But Options interface in `ajv/lib/ajv.d.ts` has no 'serialize' field.
