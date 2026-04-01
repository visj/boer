# [819] It's not possible to use a default metaschema with custom keywords

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

6.5.2.

**Ajv options object, JSON Schema, Sample data**

See code example below.

**Your code**

```javascript
const _ = require('lodash');
const Ajv = require('ajv');
const jsonSchema = require('ajv/lib/refs/json-schema-draft-07.json');

const customMeta = _.cloneDeep(jsonSchema);
_.merge(customMeta, {
  $id: 'custom',
  $schema: 'custom',
  properties: {
    customKeyword: {
      debug: true
    }
  }
});

const ajv = Ajv({
  meta: customMeta // comment me out
});

ajv.addKeyword('debug', {
  validate() {
    console.log('Debug called');
    return true;
  }
});

// ajv.addMetaSchema(customMeta);

ajv.compile({
  $schema: 'custom',
  customKeyword: true,
});
```

**What results did you expect?**

Should print `Debug called`. If you comment out the line with `comment me out` and uncomment the commented line, `Debug called` is printed.

**Are you going to resolve the issue?**

Not sure. I don't have a good feeling for the architecture of the code and this seems like potentially a non-trivial issue.

**Possible workarounds**

One could always manually include `$schema` but this is non-optimal, especially since you would also have to include it in `macro` properties and maybe other places. Possibly monkey-patching `Ajv.compile` to include `$schema`?

**Use case**

I am using `removeAdditional`. I want to define keywords which test several properties, e.g. a keyword `dateRange` which looks at properties `start`, `end` and checks that `start` is before `end`. Ideally, I don't want to have to always to have to write `{ dateRange: true, properties: { start: {}, end: {} } }` since this is redundant. Thus, I would like to add a keyword to `dateRange` in the metaschema to add `start`, `end` to properties.