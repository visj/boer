# [949] Use regexp for phone validation


**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.9


**JSON Schema**
var schema = {
  "type": "object",
  "properties": {
    "phone": { "type": "array", "items": { "type": "string", "regexp": "(\+\d{1,3}\s?)?((\(\d{3}\)\s?)|(\d{3})(\s|-?))(\d{3}(\s|-?))(\d{4})(\s?(([E|e]xt[:|.|]?)|x|X)(\s?\d+))?" }, errorMessage: { type: 'phone must be string' } },
  }
}



```json

var data =
{
  "phone": "222-222-2222"

}


**Your code**

I want to use regexp for phone number. How to use it.  I have written above code. I dont know about regexp at all i just copied pasted. 


**Validation result, data AFTER validation, error messages**
it is giving custom error message.
phone must be string

**What results did you expect?**
I want to get error message for regexp

**Are you going to resolve the issue?**
