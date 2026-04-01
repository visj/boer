# [2210] Add ability to modify AjvOptions on IOpenAPIResponseValidator arguments

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**
8.6.4

**What problem do you want to solve?**
I would like to be able to modify AJV options in custom response validators (IOpenAPIResponseValidator).

**What do you think is the correct solution to problem?**
Adding AjvOptions to OpenAPIResponseValidatorArgs just like there is an option in OpenAPIRequestValidatorArgs.
That would allow something like:
```
constructor(args: OpenAPIRequestValidatorArgs) {
    args.ajvOptions = {
      ...args.ajvOptions,
      discriminator: true,
    };
    super(args);
  }
```
Like I was able to do in a custom request validator.

**Will you be able to implement it?**
Yes.
