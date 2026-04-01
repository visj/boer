# [1545] How can I ignore some keywords in schemas when validating?


**What version of Ajv you are you using?**
6.12.6
**What problem do you want to solve?**
In my project , I use the same jsonschema in many place, like web page and backend API。when I use the same jsonschema to validate the search params, I hope every  param can be optional, however the original jsonschema may be set the key 'required',ajv throw an error。

**What do you think is the correct solution to problem?**
May be ajv can provide an ignore keyword list 

**Will you be able to implement it?**
provide an ignore keyword list or function