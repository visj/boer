# [1903] Optimization: Add .clone() method to Ajv instance

**What version of Ajv you are you using?**

8.9.0

**What problem do you want to solve?**

Optimize Schema Compilation

**What do you think is the correct solution to problem?**

Allow Ajv instance to be cloned

**Will you be able to implement it?**

Unsure

Just wondering about a possible `ajv.clone()` method to help optimize schema compilation times. This would allow users to `.clone()` a partially configured Ajv instance, allowing additional configurations to be applied to the clone without impacting the initial instance. This with the hope of avoiding reinitialization of the whole instance in some scenarios.

### Example

```typescript
// -------------------------------------------------------------------------
// Partially Instance
// -------------------------------------------------------------------------
const ajv = addFormats(new Ajv({}), [ 
    'date-time', 'time', 'date', 'email', 'hostname', 'ipv4', 
    'ipv6', 'uri', 'uri-reference', 'uuid', 'uri-template', 
    'json-pointer', 'relative-json-pointer', 'regex'
])
.addKeyword({ keyword: 'specialized', type: 'object', validate: validateSpecialized })
.addKeyword('maxByteLength')
.addKeyword('minByteLength')
.addKeyword('modifier')
.addKeyword('kind')

// ------------------------------------------------------------
// Full Instance
//
// The following clones the partial instance for the purpose
// of creating a validation context. The additional schemas
// A, B and C are added to the clone, leaving the original
// instance unchanged. This should help avoid any costly
// setup required configuring the partial instance (measured
// upwards of 100ms)
// ------------------------------------------------------------
const context = ajv.clone().addSchema([A, B, C])
const validate = context.compile(C)
```