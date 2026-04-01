# [2414] How can I make a property value depend on the value of another property?

Using [ajv](https://ajv.js.org/) is it possible to get a validation error if minPrice is bigger than maxPrice in this schema?

```JSON
{
  "type": "object",
  "properties": {
    "minPrice": {
      "type": "number"
    },
    "maxPrice": {
      "type": "number"
    }
  }
}
```
