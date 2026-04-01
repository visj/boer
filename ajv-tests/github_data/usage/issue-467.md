# [467] Errors object not set

Hi,
Thanks for your wonderfull work.
I experienced a small (functional) bug about the error object not set, after a failed validation.
i use v4.11.6 under nodejs

basically, what i'm doing is to create custom validator for my schema

```javascript
var _ajv = require('ajv');
var _v = new _ajv({ allErrors: true, removeAdditional: true, v5: true });

_v.addSchema(_toArray(_commons));
_v.addSchema(_toArray(_schemas));

// base validator class
var _validator = function () {}
_validator.prototype.assertValid= function (o) {
    if (!this._v(o)) {
        throw _v.errorsText(); 
    }
}

var _createValidator = function (validator, name) {
    return function () {
        this._n = '#' + name;
        this._v = validator.getSchema(this._n);
    }
}

var _utils = require('util');

Object.keys(_schemas).forEach(k => {
    let nk = k.replace(/\W/g, '');
    let name = k.concat('Validator')
    exports[name] = _createValidator(_v, k);
    _utils.inherits(exports[name], _validator);
});
```
This work like a charm and i'm validating or reject correctly data according to my schemas, except i'm not able to get any errors object set...
