# [2264] Referencing to key's value within schema

Hi,

my object is like below as per schema:

```
    {
      "name": "new_york",       // new_york
      "address": {
        "type": "type1",
        "title": "adsas sadfd",
        "propertyValue": {
          "new_york":          // need to access dynamic value 'new_york' by refering to "name" field available on top
           {
           type: 'type2'
          }
        },
        "key": "new_york"
      }
    }
```

and My schema is as follows:

```
{
  name: {
    type: 'string'
  },
  address: {
    type: 'object',
    properties: {
      title: {
        const: { $data: '2/label' },
        errorMessage: {
          const: 'must be equal to ${2/label}'
        }
      },
      key: {
        const: { $data: '2/name' },
        errorMessage: {
          const: 'must be equal to ${2/name}'
        }
      },
      propertyValue: {
        type: 'object',                                         // here that dynamic validation must happen
        additionalProperties: true
      },
    },
    required: ['type', 'title', 'key', 'properties', 'required'],
    additionalProperties: {
      not: true,
      errorMessage: 'must NOT have additional property ${0#}'
    }
  }
}
```

So, _**propertyValue**_ object contains _name_ field value(i.e **new_york**) in the object which is dynamic
    "propertyValue": {
          "**new_york**": {
           type: 'type2'
          }
      }

But How can validate in json schema that _**propertyValue**_ object contains _name_ field value(i.e **new_york**) like i have done under _key_ field object i.e $data: '2/name'?
