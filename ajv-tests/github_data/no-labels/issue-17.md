# [17] Pattern property is not escaped

Hi ! I have an issue with the following code :

``` javascript
var ajvFissiles = new Ajv().compile({
        "type" : "object",
        "patternProperties": {
            "^.+$" : {
                "type" : "object",
                "properties" :  {
                    "unit" : { "type" : "string", "enum" : ["ap", "ac", "ap", "af"]},
                    "density" : { "type" : ["string", "number"]},
                    "compositions" : { "type" : "array"}
                },
                "required" : ["unit", "compositions"],
                "additionalProperties": false
            }
        },
        "additionalProperties" : false
    });
```

I get the following message : 

```
Error compiling schema, function code:   validate = function (data, dataPath) { 'use strict'; validate.errors = null; var errors = 0;              if ((data && typeof data === "object" && !Array.isArray(data))) {               var errs0 = errors;var valid1 = true; var propertiesSchema0 = validate.schema.properties || {}; for (var key0 in data) { var isAdditional0 = propertiesSchema0[key0] === undefined;  if (isAdditional0) {  if (/^.+$/.test(key0)) isAdditional0 = false;   }  if (isAdditional0) {   valid1 = false;   validate.errors = [ { keyword: 'additionalProperties', dataPath: (dataPath || '') + "['" + key0 + "']", message: 'additional properties NOT allowed'  }]; return false;   break;    } }   if (valid1) {      for (var key0 in data) { if (/^.+$/.test(key0)) {     var data1 = data[key0];    var errs_1 = errors;      if ((data1 && typeof data1 === "object" && !Array.isArray(data1))) {           if (   data1.unit === undefined   ||  data1.compositions === undefined ) {   var err =   { keyword: 'required', dataPath: (dataPath || '') + "['" + key0 + "']", message: 'properties unit, compositions are required'  }; if (validate.errors === null) validate.errors = [err]; else validate.errors.push(err); errors++;  }  else {             var errs1 = errors;var valid2 = true; var propertiesSchema1 = validate.schema.patternProperties.^.+$.properties || {}; for (var key1 in data1) { var isAdditional1 = propertiesSchema1[key1] === undefined;  if (isAdditional1) {   valid2 = false;   var err =   { keyword: 'additionalProperties', dataPath: (dataPath || '') + "['" + key0 + "']['" + key1 + "']", message: 'additional properties NOT allowed'  }; if (validate.errors === null) validate.errors = [err]; else validate.errors.push(err); errors++;   break;    } }   if (valid2) {          var data2 = data1.unit;   if (data2 === undefined) { valid2 = true; } else {     var errs_2 = errors;             var enumSchema2 = validate.schema.patternProperties.^.+$.properties['unit'].enum , valid2 = false;for (var i2=0; i2<enumSchema2.length; i2++) if (equal(data2, enumSchema2[i2])) { valid2 = true; break; } if (!valid2) {   var err =   { keyword: 'enum', dataPath: (dataPath || '') + "['" + key0 + "'].unit", message: 'should be equal to one of values'  }; if (validate.errors === null) validate.errors = [err]; else validate.errors.push(err); errors++;  }      if (errors === errs_2) {     if (typeof data2 !== "string") {   var err =   { keyword: 'type', dataPath: (dataPath || '') + "['" + key0 + "'].unit", message: 'should be string'  }; if (validate.errors === null) validate.errors = [err]; else validate.errors.push(err); errors++;  } }  var valid2 = errors === errs_2;   }     if (valid2) {          var data2 = data1.density;   if (data2 === undefined) { valid2 = true; } else {     var errs_2 = errors;       if (typeof data2 !== "string" && typeof data2 !== "number") {   var err =   { keyword: 'type', dataPath: (dataPath || '') + "['" + key0 + "'].density", message: 'should be string,number'  }; if (validate.errors === null) validate.errors = [err]; else validate.errors.push(err); errors++;  }   var valid2 = errors === errs_2;   }     if (valid2) {            if (data1.compositions === undefined) { valid2 = true; } else {     var errs_2 = errors;       if (!Array.isArray(data1.compositions)) {   var err =   { keyword: 'type', dataPath: (dataPath || '') + "['" + key0 + "'].compositions", message: 'should be array'  }; if (validate.errors === null) validate.errors = [err]; else validate.errors.push(err); errors++;  }   var valid2 = errors === errs_2;   }     }}} }    }   else {   var err =   { keyword: 'type', dataPath: (dataPath || '') + "['" + key0 + "']", message: 'should be object'  }; if (validate.errors === null) validate.errors = [err]; else validate.errors.push(err); errors++;  }      var valid1 = errors === errs_1;     if (!valid1) break;  }  else valid1 = true;  }   }     }   else {   validate.errors = [ { keyword: 'type', dataPath: (dataPath || '') + "", message: 'should be object'  }]; return false;  }      return errors === 0; }    
```

Do you have any idee ?
