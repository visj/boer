# [2282] Validate object value against array of objects

I am trying to create ajv based json schema validations. I want to validate if page.id value is equal to any one navigation.ids present in an array. For example:

    `"page": {
        "id": "1"
    },
    "navigation": [
        {"id": "1"},
        {"id": "2"},
        {"id": "3"}
    ]`

Can anyone please help suggest how can I validate this using ajv.

I was able to check if page.id is equal to first/second/third element in array, but if I specifically mention the element index while checking. However, the requirement is to check if id is equal to any of the element inside the array. Note: the size of navigation array is not limited or fixed.

    `page: {
        type: "object",
        properties: {
          id: {
            type: "string",
            const: { $data: "/navigation/0/id"},
          }
    `
