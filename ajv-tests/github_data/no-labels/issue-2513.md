# [2513] Does AJV support for selective validation options?

Hi AJV team,

First off, thank you for this amazing project! It’s been incredibly helpful for our work.

I have a question regarding AJV’s capabilities, and I’m curious if it currently supports this or if there’s a recommended approach to implement it.

We’re working on an incompleteness check feature for existing customer data in our application. This feature is part of a backend service used by multiple mini-apps. To make it more flexible, we aim to support two different validation options:

Basic completeness check: Only validate the presence of required fields to determine whether the customer data is fully filled out (including checks inside if-then-else conditions).
Full validation: Validate all constraints, including required, maxLength, minLength, and more, with allErrors enabled for comprehensive error reporting.
Currently, we are handling this manually by filtering the ErrorObject returned from AJV validation, depending on the option specified by the mini-app.

Does AJV have a built-in way to support such selective validation? If not, do you have any recommendations on how to implement this more efficiently?

Thank you for your time, and I look forward to your guidance!