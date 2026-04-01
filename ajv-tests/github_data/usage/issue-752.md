# [752] Question: Custom Keyword with rules defined in schema

Given a custom keyword that constructs a URL from the input data and sends a HTTP GET request to that URL, I want to be able to validate the response _against_ the input data with rules defined in JSON Schema.

The custom keyword `validate` function can imperatively run this validation but the question is: how can the response be declaratively validated against the schema.

Schema:
```json
{
  "properties": {
    "username": {
      "type": "string"
    },
    "userId": {
      "type": "integer",
      "lookup": {
        "endpoint": "http://example.com/users",
      },
    }
  }
}
```

Custom keyword `validate` function:
```js
const lookup = (schema, data, ..., rootData) => {
  return fetch(`${schema.endpoint}/${data.userId}`)
    .then(res => res.json())
    .then(json => {
      // How to encode this validation in JSON Schema?
      return json.username === rootData.username
    })
}
```