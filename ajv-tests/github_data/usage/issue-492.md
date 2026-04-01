# [492] Uniqueness across fields

I have some objects inside of an array, and each object contains an `id` that should be unique within the array.

~~~js
{
  "items": [
    { "id": 1, "name": "ajv" },
    { "id": 2, "name": "ajv-cli" },
    { "id": 3, "name": "ajv-errors" }
  ]
}
~~~

Is there a way to validate the uniqueness of the `id` field within the `items` array?