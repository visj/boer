# [418] Allow custom types instead string when format is specified

**What version of Ajv you are you using?**
4.11.3

**What problem do you want to solve?**
I would like to be able to validate custom types using the `format` option. I'd like to create a JavaScript API where developers can use data types as defined by the [Swagger specification][swagger-specification].

Because the API is a JavaScript API, I'd like to also accept more types than just JSON values. I want to be able to accept any type, and convert it to a representing basic value.

For example, I would like these to work:
```js
// Convert the date to iso8606 before validation, or even simply allow Date objects.
ajv.validate({type: 'string', format: 'date-time'}, new Date())
ajv.validate({type: 'string', format: 'date'}, new Date())

// Convert the blob to base64 or a binary string before validation, or even simply allow Blob objects.
ajv.validate({type: 'string', format: 'byte'}, new Blob())
ajv.validate({type: 'string', format: 'binary'}, new Blob())
```

I'm able to accomplish this using [Python jsonschema][python jsonschema],but not using any JavaScript library I could find.

**What do you think is the correct solution to problem?**
The most efficient way would be to allow alternative types (other than string) when a format is specified.

**Will you be able to implement it?**
I might be, I'll have to dive into the library code.


[python jsonschema]: https://github.com/Julian/jsonschema
[swagger-specification]: http://swagger.io/specification/#data-types-12