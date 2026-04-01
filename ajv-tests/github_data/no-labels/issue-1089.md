# [1089] Question: Allow arbitrary json object

This is a question!

I've had a lot of issues finding the solution and I'm probably not asking correctly what exactly I'm trying to solve but here is my question:

I've got a schema which serves as a wrapper to all my models.  It essentially adds a property to the responses of each model which provides some context for the client to make sense of the stored data.

Here is what the response looks like:
```
{
  "data": {
      id: 1,
      ...
  },
  "_app": {
    "type": "cart",
    "version": "v1"
  }
}
```

This works great when I'm defining my models very strictly.

But suppose I want to leverage this schema to a more loose model.  A model that is the output of a report that gets generated every hour for example.  Many different variations of the report results and thats ok.

```
{
  "data": {
      <arbitrary json>
  },
  "_app": {
    "type": "analysis",
    "version": "v1"
  }
}
```

I've defined the following as my schema and I can't figure out how to let the data "object" property just return the results.. it always just returns an empty JSON object or nothing at all if I don't return it before my API response.

```
fastify.addSchema({
  $id: "analysis",
  type: "object",
  properties: {
    data: {
      type: "object"
    },
    _app: {
      type: "object",
      properties: {
        type: {
          type: "string",
          default: "analysis"
        },
        version: {
          type: "string",
          default: "v1"
        }
      },
      default: {
        type: "analysis",
        version: "v1"
      },
      required: ["type", "version"]
    }
  },
  required: ["_app"]
});
```

Is the only way to force the `data` object to validate to just not use ajv?  I'm basically trying to have a loose validation.. like how Joi lets you say this is a JSON object, without needing to define the contents.

Appreciate the help and remember that other newbies may search for this use case in the issues section, so pointing me to the docs and saying "go figure it out it says it here in the spec blah blah" doesn't really help :(
