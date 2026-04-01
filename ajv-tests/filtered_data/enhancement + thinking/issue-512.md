# [512] `schemaPath` in `ajv.errors` is often incorrect for errors inside `$ref`'d schema

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

4.11.8 and 5.1.5. Yes.


**Ajv options object**

Only `{ v5: true }` is needed (and only for version 4), in order to have `$ref`.


**JSON Schema**

Schemas with a `$ref` that doesn't contain `#` or that ends in `#/`.


**Sample data**

Data that makes validation fail because of the `$ref`'d schema.


**Your code**

Minimal example:
```javascript
var options = { v5: true };
var ajv = require('ajv')(options);
ajv.addSchema([
  { id: '/a', type: 'integer' },
  { id: '/b', items: { $ref: '/a' } }
]);
var data = [true]; // is not valid
```


**Validation result, data AFTER validation, error messages**

``` javascript
ajv.validate('/b', data);  // false
ajv.errors[0].schemaPath;  // '/a/type', but should be '/a#/type'
```

**What results did you expect?**

For that example, the correct schema path is `'/a#/type'`.

A longer example illustrates what happens, and points to a workaround and maybe a correct fix:
```javascript
ajv = require('ajv')({ v5: true });
ajv.addSchema([
  { id: '/a', type: 'integer' },
  { id: '/b', items: { $ref: '/a' } },
  { id: '/c', items: { $ref: '/a#' } },
  { id: '/d', items: { $ref: '/a#/' } }
]);
ajv.validate('/b', [4]);  // true
ajv.validate('/c', [4]);  // true
ajv.validate('/d', [4]);  // true
ajv.validate('/b', [true]);  // false
ajv.errors[0].schemaPath;    // '/a/type'
ajv.validate('/c', [true]);  // false
ajv.errors[0].schemaPath;    // '/a#/type'
ajv.validate('/d', [true]);  // false
ajv.errors[0].schemaPath;    // '/a#//type'
```

A workaround consists of including an empty fragment (as in `{ "$ref": "/a#" }`) when writing the schema. It is not a normalized id, but apparently that doesn't hurt anything.

As to fixing it...

I _think_ this is controlled here https://github.com/epoberezkin/ajv/blob/master/lib/dot/ref.jst#L44, but I'm not sure it's the only place. _If_ this guess is correct, then the fix could be as simple as replacing that line with `$it.errSchemaPath = $schema.indexOf('#') != -1 ? $schema : $schema + '#'`.

That doesn't address the `#/` case in schema `"/d"`. As far as I can tell, https://github.com/epoberezkin/ajv/blob/master/lib/dot/ref.jst#L26 calls https://github.com/epoberezkin/ajv/blob/fde7030a19833273b08e8de879cb2bf149adaf2f/lib/compile/index.js#L170, which in turn calls https://github.com/epoberezkin/ajv/blob/master/lib/compile/resolve.js#L225, which does eliminate terminal `#` or `#/`. (For example, `it.resolve.url('/b', '/a#') == '/a'` and `it.resolve.url('/b', '/a#/') == '/a'`, while `it.resolve.url('/b', '/a#something') == '/a#something'`.) Maybe there is some practical way of taking advantage of getting the normalized schema id from the `$refVal` in L26? (Normalizing it again seems wasteful...)


**Are you going to resolve the issue?**

It would be cool, but I'm not at all certain I can understand all the ramifications. Specifically, I can't figure what should happen in the non-inlined case (L51 onward), and I can't follow the workings of the refVals (to address also the case with `#/` ending) nor whether the change would have negative impact elsewhere. But maybe with some advice I can navigate it?