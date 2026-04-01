# [1849] ajv cannot load pointer hashes from remote JSON schema

I am using the latest version of ajv.

When I am compiling the following schema:

```
{ title: 'Device Object',
description: 'Defines the Device Model',
type: 'object',
$id: 'https://catena.rossvideo.com/schemata/ogp.schema.json',
properties:
 { slot: { '$ref': '#/$defs/slot' }}
required: [ 'slot' ],
additionalProperties: false }}
```

`AnySchema https://catena.rossvideo.com/schemata/ogp.schema.json is loaded but https://catena.rossvideo.com/schemata/ogp.schema.json#/$defs/slot cannot be resolved`

where `ogp.schema.json` is (from a private domain) and is being loaded under the loadSchema method.

```
{
$schema: "https://json-schema.org/draft-07/schema#",
title: "OGP Schema",
description: "OGP Schema",
type: "boolean",
default: true,
$defs: {
slot: {
title: "Slot ID",
description: "Uniquely identifies the device within the scope of its frame",
type: "integer",
min: 0,
max: 255,
default: 0,
$comment: "Max slot index is set abitrarily, it could go higher if needed."
}
.....
```
