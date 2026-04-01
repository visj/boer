# [550] params component of errors when ajv-errors is used

I am using v5.2.2 of ajv with v1.0.0 of ajv-errors and i'm seeing a variation in the format of the params object that is returned within errors. The variation occurs when the schema actions the errorMessages keyword.

Is this expected behaviour?

When no errorMessage is defined for the error that occurs then the expected documented format of errors is returned with params set to the validation rule from the schema.

e.g: schema
```
"moreInformation": {
    "type": "string",
    "pattern": "Geoff",
    "maxLength": 1000000,
    "errorMessage": {
        "maxLength": "please keep more information less than 1000000 characters"
    }
},
```
error result (when moreInformation is not set to "Geoff"):
```
 { keyword: 'pattern',
    dataPath: '/moreInformation',
    schemaPath: '#/properties/moreInformation/pattern',
    params: { pattern: 'Geoff' },
    message: 'should match pattern "Geoff"' } 
```

However, when the errorMessage becomes applicable the format of params changes to be an array that contains an error.params object.

e.g: (same) schema
```
"moreInformation": {
    "type": "string",
    "pattern": "Geoff",
    "maxLength": 1000000,
    "errorMessage": {
        "maxLength": "please keep more information less than 1000000 characters"
    }
},
```
result (when moreInformation is too long):
```
  { keyword: 'errorMessage',
    dataPath: '/moreInformation',
    schemaPath: '#/properties/moreInformation/errorMessage',
    params: { errors: [Object] },
    message: 'please keep more information less than 1000000 characters' } ]
```
(notice now params is now an error object array)
The errors array in params only has one entry (which is the original format of the error response):
```
{ keyword: 'maxLength',
  dataPath: '/moreInformation',
  schemaPath: '#/properties/moreInformation/maxLength',
  params: { limit: 1000000 },
  message: 'should NOT be longer than 1000000 characters' }
```

Should we expect this variation in the error response format or it is a side effect of the use of ajv-errors when we have not defined a message for every error?
Thanks
Geoff