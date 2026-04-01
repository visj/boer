# [1959] Reusable Global Helper Functions

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?** 
Latest

**What problem do you want to solve?** 
Decrease compiled validator code size

**What do you think is the correct solution to problem?**
With definition of a custom `CodeKeywordDefinition` is it possible using `gen` scope to define a reusable function that would be declared once in a global scope of a schema validator compilation instead of inline reinjection the same declaration clone per each keyword reference.

E.g. for a schema
```js
{
    id: 'someSchema',
    properties:  {
         a: {customKeyword: 'options'},
         b: {customKeyword: 'options'},
     }
}
```
instead of compilation (pseudo code)
```js
const  someSchemaValidator = (data, ...) => {
   // a declaration
        function customKeywordHelper0() {.......}
        if (customKeywordHelper0(data.a)) {
            errors = [{path: '/a', keyword: 'customKeyword'}]
        }
   // b declaration
        function customKeywordHelper1() {.......}
        if (customKeywordHelper1(data.b)) {
            errors = [{path: '/b', keyword: 'customKeyword'}]
        }
}
```
It would be nice to have
```js
const  someSchemaValidator = (data, ...) => {
  // global helper reusable declaration 
   function customKeywordHelper() {.......}

   // a declaration
        if (customKeywordHelper(data.a)) {
            errors = [{path: '/a', keyword: 'customKeyword'}]
        }
   // b declaration
        if (customKeywordHelper(data.b)) {
            errors = [{path: '/b', keyword: 'customKeyword'}]
        }
}
```

**Will you be able to implement it?** 
I'm curious whether it is feasible in terms of current implementation. Maybe there's something `it.root.gen` available for this purpose?
If not I can assist after a high level  introduction into the most appropriate way to implement this since I'm not really familiar with the internal design for now .

P.S. Do I see it correct  as `CodeKeywordDefinition` is something the former `inline` keywords definition are evolved with time to?

Thank you.
