# [555] Proposal: dynamic default assignment

**What version of Ajv you are you using?**
5.2.2

**What problem do you want to solve?**
Easily enable default field assignments via externally supplied functions.

Currently, as near as I can figure anyway, it is not possible to dynamically allocate required schema properties.  Custom keywords appear to be invoked after the core JSON schema assertions are already made.  Take this intended behavior for instance:

```
{
  "type": "object",
  "properties": {
    "uuid_field": {
      "type": "string",
      "format": "uuid"
    }
  },
  "required": ["uuid_field"]
}
```

Now suppose we want to auto-generate a uuid if one isn't supplied.

If we try to achieve this behavior by using a custom keyword, it needs to be specified on the "object", but any "modifying" keywords won't be executed until after the required property list is executed.  E.g.:

```
const data = {};

const schema = {
  "type": "object",
  "properties": {
    "uuid_field": {
      "type": "string",
      "format": "uuid"
    }
  },
  "required": ["uuid_field"],
  "generate": {"uuid_field": "uuid_gen"}
}

const generators = {
  uuid_gen: () => uuid.v4()
}

ajv_instance.addKeyword('generate', {
  modifying: true,
  errors: true,
  compile(schema, parent) {
    for (const [field, gen] of Object.entries(schema)) {
      if (!generators[gen]) throw new Error(`Unsupported generator: ${gen}`);
    }

    return (data, path, parent, key) => {
      for (const [field, gen] of Object.entries(schema)) {
        data[key] = generators[gen]();
      }
      return true;
    }
  }
});
```

When validating the above, we get a "should have required property 'uuid'" error, because the generated code is verifying the required properties before the generate keyword has an opportunity to act on the object.

**What do you think is the correct solution to problem?**
I think allowing users to configure dynamic defaulter functions could be useful.  In this situation, the problem collapses to:

```
{
  "type": "object",
  "properties": {
    "uuid_field": {
      "type": "string",
      "format": "uuid",
      "default": "uuid_gen"
    }
  },
  "required": ["uuid_field"]
}

// ajv requires a new option and utilizes the existing "shared" defaults to invoke user-supplied default generator functions

const ajv = new ajv({useDefaults: 'shared', defaulters: {uuid_gen: () => uuid.v4()}});
```

**Will you be able to implement it?**
I have a functional PR ready to submit whenever and working against the unit tests.  Essentially, it just takes in these defaulter arguments, and generates function invocations here: https://github.com/epoberezkin/ajv/blob/master/lib/compile/index.js#L239 whenever the default value passed into this function is a registered defaulter name.

What it really seems might be useful to me is providing some control over the order of execution of addKeyword behavior (if this doesn't already exist and I'm not just missing it) so that "modifying" keywords can execute before standard "type" / "format" / "required" assertions are executed.  This would make format coercions viable as well without needing to a) put coercions on an object parent or b) replace the build-in "format" keyword.