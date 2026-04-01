# [2290] Support format property for object type of schemas

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**
8.12.0

**What problem do you want to solve?**
Unable validate object type of schemas which properties are dependent to each other.

Consider the following phone number schema:
```js
const schema = {
    type: 'object',
    required: ['email', 'phone'],
    properties: {
        email: { type: 'string', format: 'email' }, // I have the email format and it works well
        phone: {
            type: 'object',
            required: ['num', 'country'],
            /* format: 'phone_num' // This is what I wish for. */
            properties: {
                num: { type: 'string' },
                country: { type: 'string', format: 'country_code' } // I have the country_code format and it works well
            }
        }
    }
}
```

Phone number schema needs one validator function that has `num` and `country`, as you guess. But I didn't see any way to validate this object as a whole in docs. Is there a recommended way to achieve this? Or is it something ajv doesn't support?

**What do you think is the correct solution to problem?**
Support format property for object type of schemas.

**Will you be able to implement it?**
I don't know yet.
