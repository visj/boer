# [127] default not working in anyOf and oneOf but allOf

Schema:

``` json
{
  "anyOf": [{
    "type" : "object",
    "properties": {
      "key1": {"type": "string", "default": "A"}
    },
    "required": ["key1"]
  }]
}
```

input-data: 

``` json
{}
```

should result in:

``` json
{
  "key1": "A"
}
```

But it produces errors if default is used. This happens in case of "anyOf" and "oneOf". "allOf" works.
Tested with ajv version 3.4.0 on Node.js v4.2.6 on 64bit Linux.
Option `useDefault: true` is used
