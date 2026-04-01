# [583] Add a more user friendly way to use json schema draft v4 and v5

**What version of Ajv you are you using?**
5.2.3

**What problem do you want to solve?**
I'm looking for a simple way to use ajv to validate draft v4 and v5 schemas. Right now my code is getting into the details of json schema and ajv more then I would like. 

Here is the snippet of code to create an ajv instance for Draft 4:

```javascript
var ajv = new Ajv({
  meta: false, // optional, to prevent adding draft-06 meta-schema
  extendRefs: true, // optional, current default is to 'fail', spec behaviour is to 'ignore'
  unknownFormats: 'ignore',  // optional, current default is true (fail)
  // ...
});

var metaSchema = require('ajv/lib/refs/json-schema-draft-04.json');
ajv.addMetaSchema(metaSchema);
ajv._opts.defaultMeta = metaSchema.id;

// optional, using unversioned URI is out of spec, see https://github.com/json-schema-org/json-schema-spec/issues/216
ajv._refs['http://json-schema.org/schema'] = 'http://json-schema.org/draft-04/schema';

// Optionally you can also disable keywords defined in draft-06
ajv.removeKeyword('propertyNames');
ajv.removeKeyword('contains');
ajv.removeKeyword('const');
```

**What do you think is the correct solution to problem?**
Some way for me to simply pick the version of schema I want to use. Perhaps a property could added to the options to allow the schema version to be specified. Or I use a different function to create the ajv instance, whatever makes it easy to implement.

Here is a snippet of code to create a Draft 4 instance using the option to specify schema version approach:

```javascript
var ajv = new Ajv({jsonSchemaVersion: 'draft4'});
```

**Will you be able to implement it?**
Not in the foreseeable future.