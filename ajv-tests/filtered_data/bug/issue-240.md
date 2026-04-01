# [240] Undefined refs when recursive fragment refs reference a common schema

Hi @epoberezkin, I've started evaluating `ajv` as an alternative for `tv4` and so far it looks like a dramatic performance improvement. I'm thrilled and grateful you've released this.

In switching validators I hit a somewhat confusing error case which required some work to isolate. I'll  provide as minimal a reproduction here as I've been able to isolate.

I've got two schemas which each reference fragments in each other and where the referenced fragments both in turn reference a common schema:

```
+------------------------+
|                        |
| schema://domain.schema |
|                        |
+-+----------------------+
  |
  |
  |     +------------------------------+
  |     |                              |
  +------>schema://catalog_item.schema |              +-------------------------+
  |     |                            + |              |                         |
  |     |     #resource_identifier+-----------+       | schema://api.schema     |
  |     |                        ^   | |      |       |                         |
  |     +------------------------------+      |       |     #resource           |
  |                              |   |        |       |                         |
  |                              |   |        +------------>#resourceIdentifier |
  |                              |   |        |       |                         |
  |     +--------------------------+ |        |       +-------------------------+
  |     |                        | | |        |
  +------>schema://library.schema+ | |        |
        |                          | |        |
        |     #resource_identifier+-----------+
        |                     ^    | |
        +--------------------------+ |
                              |      |
                              +------+
```

When attempting to validate against `schema://domain.schema` I encountered a TypeError which offered very little guidance as to where my schema structure was confusing `ajv`:

```
TypeError: Cannot read property 'schema://api.schema#resource_identifier' of undefined
  at Object.resolveRef (...node_modules/ajv/lib/compile/index.js:145:32)
  ...
```

This is surfacing from https://github.com/epoberezkin/ajv/blob/master/lib/compile/index.js#L145

```
...
var rootRefId = root.refs[ref];
      if (rootRefId !== undefined) {
...
```

It looks like there's a related `undefined` test here but in this case `root.refs` is `undefined`.

Extracting these fragments into their own schemas (as hinted at in #210) allows `ajv` to successfully load and validate this schema structure. Should I have expected this to work, should I have take a different approach in solving it?

(_Hopefully coffee script examples are acceptable._)
## Failing example:

``` coffee
Ajv = require 'ajv'

# Define a schema for the general structure of an API response containing resourcces and references to other resources.
apiSchema = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  id: 'schema://api.schema#',
  resource: {
    id: '#resource'
    properties: {
      id: {
        type: 'string'
      }
    }
  },
  resourceIdentifier: {
    id: '#resource_identifier',
    properties: {
      id: {
        type: 'string'
      },
      type: {
        type: 'string'
      }
    }
  }
}

# Define schemas for the resources in our domain.
librarySchema = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  id: 'schema://library.schema#',
  properties: {
    name: {
      type: 'string'
    },
    links: {
      properties: {
        catalogItems: {
          type: 'array',
          items: {
            $ref: 'schema://catalog_item.schema#resource_identifier'
          }
        }
      }
    }
  },
  definitions: {
    resource_identifier: {
      id: '#resource_identifier',
      allOf: [
        {
          properties: {
            type: {
              type: 'string',
              enum: ['Library']
            }
          }
        },
        {
          $ref: 'schema://api.schema#resource_identifier'
        }
      ]
    }
  }
}

catalogItemSchema = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  id: 'schema://catalog_item.schema#',
  properties: {
    name: {
      type: 'string'
    },
    links: {
      properties: {
        library: {
            $ref: 'schema://library.schema#resource_identifier'
        }
      }
    }
  },
  definitions: {
    resource_identifier: {
      id: '#resource_identifier',
      allOf: [
        {
          properties: {
            type: {
              type: 'string',
              enum: ['CatalogItem']
            }
          }
        },
        {
          $ref: 'schema://api.schema#resource_identifier'
        }
      ]
    }
  }
}

# Define a root schema for all API responses to require that they contain a known domain type.
domainSchema = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  id: 'schema://domain.schema#',
  properties: {
    data: {
      oneOf: [
        { $ref: 'schema://library.schema#resource_identifier' },
        { $ref: 'schema://catalog_item.schema#resource_identifier' },
      ]
    }
  }
}

validator = new Ajv(
  allErrors: false,
  verbose: true
)

validator.addSchema(librarySchema)
validator.addSchema(catalogItemSchema)
validator.addSchema(apiSchema)
validator.addSchema(domainSchema)
console.log validator.validate( { $ref: 'schema://domain.schema' }, {})
```
## Successful example:

``` coffee
Ajv = require 'ajv'

# Define a schema for the general structure of an API response containing resourcces and references to other resources.
apiSchema = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  id: 'schema://api.schema#',
  resource: {
    id: '#resource'
    properties: {
      id: {
        type: 'string'
      }
    }
  },
  resourceIdentifier: {
    id: '#resource_identifier',
    properties: {
      id: {
        type: 'string'
      },
      type: {
        type: 'string'
      }
    }
  }
}

# Define schemas for the resources in our domain.
librarySchema = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  id: 'schema://library.schema#',
  properties: {
    name: {
      type: 'string'
    },
    links: {
      properties: {
        catalogItems: {
          type: 'array',
          items: {
            $ref: 'schema://catalog_item_resource_identifier.schema'
          }
        }
      }
    }
  }
}

libraryResourceIdentifierSchema = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  id: 'schema://library_resource_identifier.schema#',
  allOf: [
    {
      properties: {
        type: {
          type: 'string',
          enum: ['Library']
        }
      }
    },
    {
      $ref: 'schema://api.schema#resource_identifier'
    }
  ]
}

catalogItemSchema = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  id: 'schema://catalog_item.schema#',
  properties: {
    name: {
      type: 'string'
    },
    links: {
      properties: {
        library: {
            $ref: 'schema://library_resource_identifier.schema'
        }
      }
    }
  }
}

catalogItemResourceIdentifierSchema = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  id: 'schema://catalog_item_resource_identifier.schema#',
  allOf: [
    {
      properties: {
        type: {
          type: 'string',
          enum: ['CatalogItem']
        }
      }
    },
    {
      $ref: 'schema://api.schema#resource_identifier'
    }
  ]
}

# Define a root schema for all API responses to require that they contain a known domain type.
domainSchema = {
  $schema: 'http://json-schema.org/draft-04/schema#',
  id: 'schema://domain.schema#',
  properties: {
    data: {
      oneOf: [
        { $ref: 'schema://library.schema' },
        { $ref: 'schema://catalog_item.schema' },
      ]
    }
  }
}

validator = new Ajv(
  allErrors: false,
  verbose: true
)

validator.addSchema(librarySchema)
validator.addSchema(libraryResourceIdentifierSchema)
validator.addSchema(catalogItemSchema)
validator.addSchema(catalogItemResourceIdentifierSchema)
validator.addSchema(apiSchema)
validator.addSchema(domainSchema)
console.log validator.validate( { $ref: 'schema://domain.schema' }, {})
```
