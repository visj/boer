# [984] Validation of array properties

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv you are you using?**
6.10.0

**What problem do you want to solve?**
I want to validate array property as a whole. 
Currently, I am able to add custom validator inside "items" object.
But, the custom validator is getting called for each element in the array.
If I want to, make an IO call to validate the array property(which is most my use cases), 
the same call is repeated for size of the array times. 
So, I am looking for a way to validate the whole array at one go.
For example, if I have set of ids, which I want to know, if they present in database or not,
I like to have one validator, which will take up whole array & return true or false.
Making "isExists" call for each element seems to be an overkill.

**What do you think is the correct solution to problem?**
As I mentioned above, it would be great, if there is a way to validate whole of array properties.

**Will you be able to implement it?**
I can give it a try, if it doesn't already exists!
