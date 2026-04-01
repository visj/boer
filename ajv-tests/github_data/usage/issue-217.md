# [217] customKeyword error for Compile checks

Hi I am trying to create a custom error for a custom Keyword while using compile instead of validate.

The example here that you shared in a previous issue works fine for me https://tonicdev.com/esp/5731a55eabbf001200bbc028
However if i replace validate with compile . I cannot add any error 

`var Ajv = require('ajv');
var ajv = Ajv({
  verbose: true,
  allErrors: true
    //v5: true  //enable v5 proposal of JSON-schema standard
}); // options can be passed, e.g. {allErrors: true}

//build schema
//TODO added points to questions and check if the summation of all points are equals to maxPoints
ajv.addKeyword('validateMaxPoints', {
  errors: true,
  async: false,
  type:'object',
 compile: function myValidation(value, dataObject) {
    if (myValidation.errors === null)
      myValidation.errors = [];

```
myValidation.errors.push({
  keyword: 'validateMaxPoints',
  message: 'maxPoints attribute should be ' + 0 + ', but is ' + 0,
  params: {
    keyword: 'validateMaxPoints'
  }/*,
  dataPath: '.maxPoints',
  schemaPath: '#/validateMaxPoints',
  schema: true*/
});

return false;
```

  }
});`

Could you perhaps point me if i am doing something wrong? 
I am using the exact same code just replacing validate with compile !
How do i go about adding custom errors for the compile function?
Thanks in advance!
