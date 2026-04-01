# [1839] How to make a property nullable conditionally depending on other property

I have an object that can be in one of 4 states:

 1. `{"A": "something", "B": [{"C": "D"}]}`
 2. `{"A": "", "B": [{"C": "D"}]}`
 3. `{"A": "something", "B": null}`
 4. `{"A": "", "B": null}`

In my Ajv schema validation I want to make the property `"B"` `nullable: true` only if the property `"A"` is **not** an empty string. 

How can I achieve this?
