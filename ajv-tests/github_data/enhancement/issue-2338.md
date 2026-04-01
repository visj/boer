# [2338] Schema Mapping Validation Between JSON Schemas

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

## What version of Ajv are you using?
8.11.2

## What problem do you want to solve?
I need to validate one JSON schema against another to ensure they map onto each other based on their description. I'll be using one schema for output of a process and another for input into another process in my system, which would necessitate a validation check to ensure they align correctly.

_Note: I considered the idea of doing it dynamically (i.e. checking against the actual output of the process, instead of the schemas). However, I need to detect a possible mismatch before any processing happens._

## What do you think is the correct solution to the problem?
Implementing a Schema Mapping Validation feature between JSON schemas could do it. For instance:
1. A `string` schema `A` maps onto a `string` schema `B` if it meets the length and pattern requirements of `B`.
2. An `object` schema `A` fits onto `object` schema `B` if it encompasses at least the same `required` properties as `B`.
3. A `null` schema `A` maps onto any schema `B` if `B` also includes `null` as an allowable type.

## Will you be able to implement it?
I might be able to implement it, although I am unsure about the complexity within the library's framework. However, I am certainly willing to give it a shot!
