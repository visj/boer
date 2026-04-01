# [1865] JTDSchemaType has Typescript error with valid JTD

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

    "ajv": "^8.8.2",

** Code and error **

```
import Ajv, { JTDSchemaType } from 'ajv/dist/jtd'
const ajv = new Ajv()

// then 

export interface JumpSpec<P = unknown, T = unknown> {
  type: string
  uri: string
  param?: P
  mountAt?: string
  defaults?: T[]           // this array will caus the problem
}

const spec: JTDSchemaType<JumpSpec> = {
  properties: {
    type: { type: 'string' },
    uri: { type: 'string' },
  },
  optionalProperties: {
    param: {},
    mountAt: { type: 'string' },
    defaults: { elements: {} },    // <-- error 
  },
}
```

Typescript objects to 'elements' with : `(property) elements: {} Type '{}' is not assignable to type 'never'`

Looking at the spec:  https://datatracker.ietf.org/doc/html/rfc8927#section-2

I think elements can take the empty form from the CDDL:
```
   ; All JTD schemas are JSON objects taking on one of eight forms
   ; listed here.
   schema = (
     ref //
     type //
     enum //
     elements //
     properties //
     values //
     discriminator //
     empty //
   )
...

   ; elements describes the "elements" schema form.
   elements = ( elements: { schema }, shared )
```

Which makes me think it's a bug :-)

Thanks for your awesome validation library!
