# [1369] How can I get all properties that apply to a given object?

Given a schema and an object to validate, instead of (or in addition to) validating, I want to get all properties that apply to (or are valid for) the given object (i.e. all fixed properties and all conditional properties).

Can this be done?
 
For example, given the following data I want to get the following properties:
street_address, country, and the postal_code with the pattern "^\\d{5}$|^\\d{5}-\\d{4}$".

```
const schema = {
  type: "object",
  properties: {
    street_address: {
      type: "string",
    },
    country: {
      enum: ["United States of America", "Canada", "Netherlands"],
    },
  },
  allOf: [
    {
      if: {
        properties: { country: { const: "United States of America" } },
      },
      then: {
        properties: {
          postal_code: { type: "string", pattern: "^\\d{5}$|^\\d{5}-\\d{4}$" },
        },
      },
    },
    {
      if: {
        properties: { country: { const: "Canada" } },
      },
      then: {
        properties: {
          postal_code: {
            type: "string",
            pattern: "[A-Z]\\d[A-Z] \\d[A-Z]\\d",
          },
        },
      },
    },
    {
      if: {
        properties: { country: { const: "Netherlands" } },
      },
      then: {
        properties: {
          postal_code: { type: "string", pattern: "\\d{4} [A-Z]{2}" },
        },
      },
    },
  ],
};
const data = {
  country: "United States of America",
  postal_code: "12345-999",
};

```