# [947] Allow adding extra definitions

**What version of Ajv you are you using?**
6.9.1

**What problem do you want to solve?**

I want to extend/update my schema definitions. For example, my code has a central service where I initialize my Ajv compiler like this:

      let extra = {
        $id: 'http://example.com/schemas/core',
        definitions: {
          domainTask: {...},
        },
      }
      var ajv = new Ajv({ schemas: [extra] })

I keep that instance of Ajv to solve the definition references in all my schemas

          items: { $ref: 'core#/definitions/domainTask' },

The problem now is that I cannot extend my original list of definitions for `http://example.com/schemas/core`. If I try to add new ones it will fail because the $id is already taken.

Currently it seems that I am forced to load all my definitions at once if I want to use references. The only exception would be switching to async validation, but that levels up the complexity of my deployment (to serve the schemas).

**What do you think is the correct solution to problem?**

A way to add new definitions to an existing schema. Like ajv.getSchema(...).addDefinitions()

**Will you be able to implement it?**
no :(