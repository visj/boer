# [528] Error compiling schema (because of an optional property which is omitted)

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- browser/compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
5.2.0
yes


**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
const schema:AJV.Options = {
    allErrors: true,
    verbose: false,
    jsonPointers: false,
    uniqueItems: true,
    unicode: true,
    format: 'full',
    // formats: FormatValidations,
    unknownFormats: true,
    schemas: {},
    missingRefs: true,
    extendRefs: true, 
    loadSchema: undefined, 
    removeAdditional: false,
    useDefaults: true, 
    coerceTypes: false,
    async: undefined,
    transpile: undefined,
    meta: true,
    validateSchema: true,
    addUsedSchema: true,
    inlineRefs: true,
    passContext: false,
    loopRequired: Infinity,
    ownProperties: false,
    multipleOfPrecision: 0.1,
    errorDataPath: 'object',
    sourceCode: false,
    messages: true
};

```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->
This schema is taken from a protocol specification (OCPP).
Originally this was draft-04 (if it helps), I changed it to draft-06.

Below schema only requires `idTag` but the thrown error is related with the optional property `chargingProfile` which is actually omitted in the `data` and validation. 

```json
{
    "$schema": "http://json-schema.org/draft-06/schema#",
    "type": "object",
    "properties": {
        "connectorId": {
            "type": "integer"
        },
        "idTag": {
            "type": "string",
            "maxLength": 20
        },
        "chargingProfile": {
            "type": "object",
            "properties": {
                "chargingProfileId": {
                    "type": "integer"
                },
                "transactionId": {
                    "type": "integer"
                },
                "stackLevel": {
                    "type": "integer"
                },
                "chargingProfilePurpose": {
                    "type": "string",
                    "enum": [
                        "ChargePointMaxProfile",
                        "TxDefaultProfile",
                        "TxProfile"
                    ]
                },
                "chargingProfileKind": {
                    "type": "string",
                    "enum": [
                        "Absolute",
                        "Recurring",
                        "Relative"
                    ]
                },
                "recurrencyKind": {
                    "type": "string",
                    "enum": [
                        "Daily",
                        "Weekly"
                    ]
                },
                "validFrom": {
                    "type": "string",
                    "format": "date-time"
                },
                "validTo": {
                    "type": "string",
                    "format": "date-time"
                },
                "chargingSchedule": {
                    "type": "object",
                    "properties": {
                        "duration": {
                            "type": "integer"
                        },
                        "startSchedule": {
                            "type": "string",
                            "format": "date-time"
                        },
                        "chargingRateUnit": {
                            "type": "string",
                            "enum": [
                                "A",
                                "W"
                            ]
                        },
                        "chargingSchedulePeriod": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "startPeriod": {
                                        "type": "integer"
                                    },
                                    "limit": {
                                        "type": "number",
                                        "multipleOf" : 0.1
                                    },
                                    "numberPhases": {
                                        "type": "integer"
                                    }
                                },
                                "required": [
                                    "startPeriod",
                                    "limit"
                                ]
                            }
                        },
                        "minChargingRate": {
                            "type": "number",
                            "multipleOf" : 0.1
                        }
                    },
                    "required": [
                        "chargingRateUnit",
                        "chargingSchedulePeriod"
                    ]
                }
            },
            "required": [
                "chargingProfileId",
                "stackLevel",
                "chargingProfilePurpose",
                "chargingProfileKind",
                "chargingSchedule"
            ]
        }
    },
    "additionalProperties": false,
    "required": [
        "idTag"
    ]
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{ "idTag": "0454585A8B", "connectorId": 1 }

```


**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/epoberezkin/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->
**Code Example**:  
https://runkit.com/5943138c653ae70012197dd7/59550d4ddff15a001237a70a


**Validation result, data AFTER validation, error messages**
Text below is logged to console before the following error is thrown.
```
Error compiling schema, function code:  var validate =  (function  (data, dataPath, parentData, parentDataProperty, rootData) { 'use strict';  var vErrors = null;  var errors = 0;        if ((data && typeof data === "object" && !Array.isArray(data))) {      var errs__0 = errors;var valid1 = true; for (var key0 in data) {  var isAdditional0 = !(false  || key0 == 'connectorId'  || key0 == 'idTag'  || key0 == 'chargingProfile'  ); if (isAdditional0) {  valid1 = false;  var err =  { keyword: 'additionalProperties' , dataPath: (dataPath || '') + "" , schemaPath: '#/additionalProperties' , params: { additionalProperty: '' + key0 + '' }  , message: 'should NOT have additional properties'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }  }   var data1 = data.connectorId;  if (data1 !== undefined  ) {   var errs_1 = errors; if ((typeof data1 !== "number" || (data1 % 1) || data1 !== data1)) {  var err =  { keyword: 'type' , dataPath: (dataPath || '') + '.connectorId' , schemaPath: '#/properties/connectorId/type' , params: { type: 'integer' }  , message: 'should be integer'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }  var valid1 = errors === errs_1; }  var data1 = data.idTag;  if ( data1 === undefined ) { valid1 = false;  var err =  { keyword: 'required' , dataPath: (dataPath || '') + "" , schemaPath: '#/required' , params: { missingProperty: 'idTag' }  , message: 'should have required property \'idTag\''  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  } else {   var errs_1 = errors; if (typeof data1 === "string") {   if (  ucs2length(data1)  > 20) {  var err =  { keyword: 'maxLength' , dataPath: (dataPath || '') + '.idTag' , schemaPath: '#/properties/idTag/maxLength' , params: { limit: 20 }  , message: 'should NOT be longer than 20 characters'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; }   }  else {  var err =  { keyword: 'type' , dataPath: (dataPath || '') + '.idTag' , schemaPath: '#/properties/idTag/type' , params: { type: 'string' }  , message: 'should be string'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }  var valid1 = errors === errs_1; }  var data1 = data.chargingProfile;  if (data1 !== undefined  ) {   var errs_1 = errors; if ((data1 && typeof data1 === "object" && !Array.isArray(data1))) {      var errs__1 = errors;var valid2 = true; var data2 = data1.chargingProfileId;  if ( data2 === undefined ) { valid2 = false;  var err =  { keyword: 'required' , dataPath: (dataPath || '') + '.chargingProfile' , schemaPath: '#/properties/chargingProfile/required' , params: { missingProperty: 'chargingProfileId' }  , message: 'should have required property \'chargingProfileId\''  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  } else {   var errs_2 = errors; if ((typeof data2 !== "number" || (data2 % 1) || data2 !== data2)) {  var err =  { keyword: 'type' , dataPath: (dataPath || '') + '.chargingProfile.chargingProfileId' , schemaPath: '#/properties/chargingProfile/properties/chargingProfileId/type' , params: { type: 'integer' }  , message: 'should be integer'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }  var valid2 = errors === errs_2; }  var data2 = data1.transactionId;  if (data2 !== undefined  ) {   var errs_2 = errors; if ((typeof data2 !== "number" || (data2 % 1) || data2 !== data2)) {  var err =  { keyword: 'type' , dataPath: (dataPath || '') + '.chargingProfile.transactionId' , schemaPath: '#/properties/chargingProfile/properties/transactionId/type' , params: { type: 'integer' }  , message: 'should be integer'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }  var valid2 = errors === errs_2; }  var data2 = data1.stackLevel;  if ( data2 === undefined ) { valid2 = false;  var err =  { keyword: 'required' , dataPath: (dataPath || '') + '.chargingProfile' , schemaPath: '#/properties/chargingProfile/required' , params: { missingProperty: 'stackLevel' }  , message: 'should have required property \'stackLevel\''  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  } else {   var errs_2 = errors; if ((typeof data2 !== "number" || (data2 % 1) || data2 !== data2)) {  var err =  { keyword: 'type' , dataPath: (dataPath || '') + '.chargingProfile.stackLevel' , schemaPath: '#/properties/chargingProfile/properties/stackLevel/type' , params: { type: 'integer' }  , message: 'should be integer'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }  var valid2 = errors === errs_2; }  var data2 = data1.chargingProfilePurpose;  if ( data2 === undefined ) { valid2 = false;  var err =  { keyword: 'required' , dataPath: (dataPath || '') + '.chargingProfile' , schemaPath: '#/properties/chargingProfile/required' , params: { missingProperty: 'chargingProfilePurpose' }  , message: 'should have required property \'chargingProfilePurpose\''  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  } else {   var errs_2 = errors; if (typeof data2 !== "string") {  var err =  { keyword: 'type' , dataPath: (dataPath || '') + '.chargingProfile.chargingProfilePurpose' , schemaPath: '#/properties/chargingProfile/properties/chargingProfilePurpose/type' , params: { type: 'string' }  , message: 'should be string'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }    var schema2 = validate.schema.properties.chargingProfile.properties.chargingProfilePurpose.enum;var valid2;valid2 = false;for (var i2=0; i2<schema2.length; i2++) if (equal(data2, schema2[i2])) { valid2 = true; break; } if (!valid2) {    var err =  { keyword: 'enum' , dataPath: (dataPath || '') + '.chargingProfile.chargingProfilePurpose' , schemaPath: '#/properties/chargingProfile/properties/chargingProfilePurpose/enum' , params: { allowedValues: schema2 }  , message: 'should be equal to one of the allowed values'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }  var valid2 = errors === errs_2; }  var data2 = data1.chargingProfileKind;  if ( data2 === undefined ) { valid2 = false;  var err =  { keyword: 'required' , dataPath: (dataPath || '') + '.chargingProfile' , schemaPath: '#/properties/chargingProfile/required' , params: { missingProperty: 'chargingProfileKind' }  , message: 'should have required property \'chargingProfileKind\''  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  } else {   var errs_2 = errors; if (typeof data2 !== "string") {  var err =  { keyword: 'type' , dataPath: (dataPath || '') + '.chargingProfile.chargingProfileKind' , schemaPath: '#/properties/chargingProfile/properties/chargingProfileKind/type' , params: { type: 'string' }  , message: 'should be string'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }    var schema2 = validate.schema.properties.chargingProfile.properties.chargingProfileKind.enum;var valid2;valid2 = false;for (var i2=0; i2<schema2.length; i2++) if (equal(data2, schema2[i2])) { valid2 = true; break; } if (!valid2) {    var err =  { keyword: 'enum' , dataPath: (dataPath || '') + '.chargingProfile.chargingProfileKind' , schemaPath: '#/properties/chargingProfile/properties/chargingProfileKind/enum' , params: { allowedValues: schema2 }  , message: 'should be equal to one of the allowed values'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }  var valid2 = errors === errs_2; }  var data2 = data1.recurrencyKind;  if (data2 !== undefined  ) {   var errs_2 = errors; if (typeof data2 !== "string") {  var err =  { keyword: 'type' , dataPath: (dataPath || '') + '.chargingProfile.recurrencyKind' , schemaPath: '#/properties/chargingProfile/properties/recurrencyKind/type' , params: { type: 'string' }  , message: 'should be string'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }    var schema2 = validate.schema.properties.chargingProfile.properties.recurrencyKind.enum;var valid2;valid2 = false;for (var i2=0; i2<schema2.length; i2++) if (equal(data2, schema2[i2])) { valid2 = true; break; } if (!valid2) {    var err =  { keyword: 'enum' , dataPath: (dataPath || '') + '.chargingProfile.recurrencyKind' , schemaPath: '#/properties/chargingProfile/properties/recurrencyKind/enum' , params: { allowedValues: schema2 }  , message: 'should be equal to one of the allowed values'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }  var valid2 = errors === errs_2; }  var data2 = data1.validFrom;  if (data2 !== undefined  ) {   var errs_2 = errors;   if (typeof data2 === "string") {    if (!  formats['date-time'](data2) ) {  var err =  { keyword: 'format' , dataPath: (dataPath || '') + '.chargingProfile.validFrom' , schemaPath: '#/properties/chargingProfile/properties/validFrom/format' , params: { format:  'date-time'  }  , message: 'should match format "date-time"'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }   }  else {  var err =  { keyword: 'type' , dataPath: (dataPath || '') + '.chargingProfile.validFrom' , schemaPath: '#/properties/chargingProfile/properties/validFrom/type' , params: { type: 'string' }  , message: 'should be string'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }  var valid2 = errors === errs_2; }  var data2 = data1.validTo;  if (data2 !== undefined  ) {   var errs_2 = errors;   if (typeof data2 === "string") {    if (!  formats['date-time'](data2) ) {  var err =  { keyword: 'format' , dataPath: (dataPath || '') + '.chargingProfile.validTo' , schemaPath: '#/properties/chargingProfile/properties/validTo/format' , params: { format:  'date-time'  }  , message: 'should match format "date-time"'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }   }  else {  var err =  { keyword: 'type' , dataPath: (dataPath || '') + '.chargingProfile.validTo' , schemaPath: '#/properties/chargingProfile/properties/validTo/type' , params: { type: 'string' }  , message: 'should be string'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }  var valid2 = errors === errs_2; }  var data2 = data1.chargingSchedule;  if ( data2 === undefined ) { valid2 = false;  var err =  { keyword: 'required' , dataPath: (dataPath || '') + '.chargingProfile' , schemaPath: '#/properties/chargingProfile/required' , params: { missingProperty: 'chargingSchedule' }  , message: 'should have required property \'chargingSchedule\''  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  } else {   var errs_2 = errors; if ((data2 && typeof data2 === "object" && !Array.isArray(data2))) {      var errs__2 = errors;var valid3 = true; var data3 = data2.duration;  if (data3 !== undefined  ) {   var errs_3 = errors; if ((typeof data3 !== "number" || (data3 % 1) || data3 !== data3)) {  var err =  { keyword: 'type' , dataPath: (dataPath || '') + '.chargingProfile.chargingSchedule.duration' , schemaPath: '#/properties/chargingProfile/properties/chargingSchedule/properties/duration/type' , params: { type: 'integer' }  , message: 'should be integer'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }  var valid3 = errors === errs_3; }  var data3 = data2.startSchedule;  if (data3 !== undefined  ) {   var errs_3 = errors;   if (typeof data3 === "string") {    if (!  formats['date-time'](data3) ) {  var err =  { keyword: 'format' , dataPath: (dataPath || '') + '.chargingProfile.chargingSchedule.startSchedule' , schemaPath: '#/properties/chargingProfile/properties/chargingSchedule/properties/startSchedule/format' , params: { format:  'date-time'  }  , message: 'should match format "date-time"'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }   }  else {  var err =  { keyword: 'type' , dataPath: (dataPath || '') + '.chargingProfile.chargingSchedule.startSchedule' , schemaPath: '#/properties/chargingProfile/properties/chargingSchedule/properties/startSchedule/type' , params: { type: 'string' }  , message: 'should be string'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }  var valid3 = errors === errs_3; }  var data3 = data2.chargingRateUnit;  if ( data3 === undefined ) { valid3 = false;  var err =  { keyword: 'required' , dataPath: (dataPath || '') + '.chargingProfile.chargingSchedule' , schemaPath: '#/properties/chargingProfile/properties/chargingSchedule/required' , params: { missingProperty: 'chargingRateUnit' }  , message: 'should have required property \'chargingRateUnit\''  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  } else {   var errs_3 = errors; if (typeof data3 !== "string") {  var err =  { keyword: 'type' , dataPath: (dataPath || '') + '.chargingProfile.chargingSchedule.chargingRateUnit' , schemaPath: '#/properties/chargingProfile/properties/chargingSchedule/properties/chargingRateUnit/type' , params: { type: 'string' }  , message: 'should be string'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }    var schema3 = validate.schema.properties.chargingProfile.properties.chargingSchedule.properties.chargingRateUnit.enum;var valid3;valid3 = false;for (var i3=0; i3<schema3.length; i3++) if (equal(data3, schema3[i3])) { valid3 = true; break; } if (!valid3) {    var err =  { keyword: 'enum' , dataPath: (dataPath || '') + '.chargingProfile.chargingSchedule.chargingRateUnit' , schemaPath: '#/properties/chargingProfile/properties/chargingSchedule/properties/chargingRateUnit/enum' , params: { allowedValues: schema3 }  , message: 'should be equal to one of the allowed values'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }  var valid3 = errors === errs_3; }  var data3 = data2.chargingSchedulePeriod;  if ( data3 === undefined ) { valid3 = false;  var err =  { keyword: 'required' , dataPath: (dataPath || '') + '.chargingProfile.chargingSchedule' , schemaPath: '#/properties/chargingProfile/properties/chargingSchedule/required' , params: { missingProperty: 'chargingSchedulePeriod' }  , message: 'should have required property \'chargingSchedulePeriod\''  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  } else {   var errs_3 = errors; if (Array.isArray(data3)) {   var errs__3 = errors;var valid3;  for (var i3 = 0; i3 < data3.length; i3++) {  var data4 = data3[i3];  var errs_4 = errors; if ((data4 && typeof data4 === "object" && !Array.isArray(data4))) {      var errs__4 = errors;var valid5 = true; var data5 = data4.startPeriod;  if ( data5 === undefined ) { valid5 = false;  var err =  { keyword: 'required' , dataPath: (dataPath || '') + '.chargingProfile.chargingSchedule.chargingSchedulePeriod[' + i3 + ']' , schemaPath: '#/properties/chargingProfile/properties/chargingSchedule/properties/chargingSchedulePeriod/items/required' , params: { missingProperty: 'startPeriod' }  , message: 'should have required property \'startPeriod\''  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  } else {   var errs_5 = errors; if ((typeof data5 !== "number" || (data5 % 1) || data5 !== data5)) {  var err =  { keyword: 'type' , dataPath: (dataPath || '') + '.chargingProfile.chargingSchedule.chargingSchedulePeriod[' + i3 + '].startPeriod' , schemaPath: '#/properties/chargingProfile/properties/chargingSchedule/properties/chargingSchedulePeriod/items/properties/startPeriod/type' , params: { type: 'integer' }  , message: 'should be integer'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }  var valid5 = errors === errs_5; }  var data5 = data4.limit;  if ( data5 === undefined ) { valid5 = false;  var err =  { keyword: 'required' , dataPath: (dataPath || '') + '.chargingProfile.chargingSchedule.chargingSchedulePeriod[' + i3 + ']' , schemaPath: '#/properties/chargingProfile/properties/chargingSchedule/properties/chargingSchedulePeriod/items/required' , params: { missingProperty: 'limit' }  , message: 'should have required property \'limit\''  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  } else {   var errs_5 = errors; if (typeof data5 === "number") {   var division5;if ( (division5 = data5 / 0.1,  Math.abs(Math.round(division5) - division5) > 1e-0.1  )  ) {    var err =  { keyword: 'multipleOf' , dataPath: (dataPath || '') + '.chargingProfile.chargingSchedule.chargingSchedulePeriod[' + i3 + '].limit' , schemaPath: '#/properties/chargingProfile/properties/chargingSchedule/properties/chargingSchedulePeriod/items/properties/limit/multipleOf' , params: { multipleOf: 0.1 }  , message: 'should be multiple of 0.1' } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; }   }  else {  var err =  { keyword: 'type' , dataPath: (dataPath || '') + '.chargingProfile.chargingSchedule.chargingSchedulePeriod[' + i3 + '].limit' , schemaPath: '#/properties/chargingProfile/properties/chargingSchedule/properties/chargingSchedulePeriod/items/properties/limit/type' , params: { type: 'number' }  , message: 'should be number'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }  var valid5 = errors === errs_5; }  var data5 = data4.numberPhases;  if (data5 !== undefined  ) {   var errs_5 = errors; if ((typeof data5 !== "number" || (data5 % 1) || data5 !== data5)) {  var err =  { keyword: 'type' , dataPath: (dataPath || '') + '.chargingProfile.chargingSchedule.chargingSchedulePeriod[' + i3 + '].numberPhases' , schemaPath: '#/properties/chargingProfile/properties/chargingSchedule/properties/chargingSchedulePeriod/items/properties/numberPhases/type' , params: { type: 'integer' }  , message: 'should be integer'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }  var valid5 = errors === errs_5; }   }  else {  var err =  { keyword: 'type' , dataPath: (dataPath || '') + '.chargingProfile.chargingSchedule.chargingSchedulePeriod[' + i3 + ']' , schemaPath: '#/properties/chargingProfile/properties/chargingSchedule/properties/chargingSchedulePeriod/items/type' , params: { type: 'object' }  , message: 'should be object'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }  var valid4 = errors === errs_4;  }  }  else {  var err =  { keyword: 'type' , dataPath: (dataPath || '') + '.chargingProfile.chargingSchedule.chargingSchedulePeriod' , schemaPath: '#/properties/chargingProfile/properties/chargingSchedule/properties/chargingSchedulePeriod/type' , params: { type: 'array' }  , message: 'should be array'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }  var valid3 = errors === errs_3; }  var data3 = data2.minChargingRate;  if (data3 !== undefined  ) {   var errs_3 = errors; if (typeof data3 === "number") {   var division3;if ( (division3 = data3 / 0.1,  Math.abs(Math.round(division3) - division3) > 1e-0.1  )  ) {    var err =  { keyword: 'multipleOf' , dataPath: (dataPath || '') + '.chargingProfile.chargingSchedule.minChargingRate' , schemaPath: '#/properties/chargingProfile/properties/chargingSchedule/properties/minChargingRate/multipleOf' , params: { multipleOf: 0.1 }  , message: 'should be multiple of 0.1' } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++; }   }  else {  var err =  { keyword: 'type' , dataPath: (dataPath || '') + '.chargingProfile.chargingSchedule.minChargingRate' , schemaPath: '#/properties/chargingProfile/properties/chargingSchedule/properties/minChargingRate/type' , params: { type: 'number' }  , message: 'should be number'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }  var valid3 = errors === errs_3; }   }  else {  var err =  { keyword: 'type' , dataPath: (dataPath || '') + '.chargingProfile.chargingSchedule' , schemaPath: '#/properties/chargingProfile/properties/chargingSchedule/type' , params: { type: 'object' }  , message: 'should be object'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }  var valid2 = errors === errs_2; }   }  else {  var err =  { keyword: 'type' , dataPath: (dataPath || '') + '.chargingProfile' , schemaPath: '#/properties/chargingProfile/type' , params: { type: 'object' }  , message: 'should be object'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }  var valid1 = errors === errs_1; }   }  else {  var err =  { keyword: 'type' , dataPath: (dataPath || '') + "" , schemaPath: '#/type' , params: { type: 'object' }  , message: 'should be object'  } ;  if (vErrors === null) vErrors = [err]; else vErrors.push(err); errors++;  }  validate.errors = vErrors;  return errors === 0;        }); return validate;

```

**Error Thrown:**  
```js
SyntaxError: Unexpected number
    at localCompile (/path/to/node_modules/ajv/lib/compile/index.js:118:26)
    at Ajv.compile (/path/to/node_modules/ajv/lib/compile/index.js:56:13)
    at Ajv._compile (/path/to/node_modules/ajv/lib/ajv.js:351:27)
    at Ajv.compile (/path/to/node_modules/ajv/lib/ajv.js:117:37)
```

