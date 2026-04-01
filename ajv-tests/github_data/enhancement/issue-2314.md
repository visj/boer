# [2314] Support $data keyword in $ref

**What version of Ajv you are you using?**
v8.12

**What problem do you want to solve?**
Validate messages with dynamic subschemas.

Our systems process many different kinds of event with different schemas. However, all the events are packaged into a single envelope. Roughly, the envelope looks like this:

```jsonc
{  // envelope
  "payload" : {  // payload
    // the actual event data is in here
  },
  "payloadSchema": "", // this is the $id of the payload's expected schema
  // additional envelope data like timestamps, source system, etc
}
```

We want to be able to validate the entire event (both the envelope and payload) in one shot. Right now, we have to validate the event stages. First we validate the envelope, then the code validates `payload` using the schema indicated in `payloadSchema`

In addition, a subset of the events also have nested payload, which requires 

```jsonc
{  // envelope
  "payload" : {  // payload for a "run" event
     "data" : { // run data 
      },
     "dataSchema" : "" // this is the $id of the run data's expected schema
      // additional run data like runId, user, etc
  },
  "payloadSchema": "", // this is the $id of the payload's expected schema
  // additional envelope data like timestamps, source system, etc
}
```

I wanted to use the $data keyword to write a schema

```jsonc
{  // envelope schema
  "type" : "object"
  "payload" : { 
    "$ref" :  {
      "$data" : "/payloadSchema" // JSONPointer to the payloadSchema property
    },
  },
  "payloadSchema": {
    "type", "string"
  }
}
```

For the run schema

```jsonc
{  // run schema
  "type" : "object"
  "data" : { 
    "$ref" :  {
      "$data" : "/dataSchema" // JSONPointer to the dataSchema property
      },
  },
  "dataSchema": {
    "type", "string"
  }
}
```

However, the `$ref` keyword does not currently support `$data`.

**What do you think is the correct solution to problem?**
Support usage of `$data` in `$ref` keyword.

**Will you be able to implement it?**
We have resources to implement but need guidance. I've looked over the code, but unsure where to start.