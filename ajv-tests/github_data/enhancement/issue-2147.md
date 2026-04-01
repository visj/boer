# [2147] Support `title` attribute for error messages

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**
8.11.0

**What problem do you want to solve?**
It'd like to present ajv's error message to end users. However, the error messages are constructed using the property name, which is not user friendly.

**What do you think is the correct solution to problem?**
Construct the error message using the `title` when present in the error message, either by default or by configuration.

> [10.1](https://datatracker.ietf.org/doc/html/draft-handrews-json-schema-validation-01#section-10.1).  "title" and "description"
> 
>    The value of both of these keywords MUST be a string.
> 
>    Both of these keywords can be used to decorate a user interface with
>    information about the data produced by this user interface.  A title
>    will preferably be short, whereas a description will provide
>    explanation about the purpose of the instance described by this
>    schema. 
> 

I probably could get what I want out of ajv-errors but it would be nice to have dx which doesn't require manually maintaining all those error messages since the built in ones look good enough and have the internationalization support.

**Will you be able to implement it?**
I have not previously contributed to this code so don't really know how complex this is. If the feature doesn't already exist and you are interested in a PR, I'd might be able to give it a shot!