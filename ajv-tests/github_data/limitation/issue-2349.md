# [2349] OneOf property is failing during OAS  Schema Validation

Hello Team,

Requesting you to please check this issue and help. Performing schema validation with oneOf, discriminator and mapping property in oas3.0.

_**Error:**_
{
"fault": {
"faultstring": "OASValidation MAM-EXT-SpecValidation with resource "oas://openapi.yaml": failed with reason: "[ERROR - An error occurred during schema validation - com.google.common.util.concurrent.UncheckedExecutionException: java.lang.NullPointerException.: []]"",
"detail": {
"errorcode": "steps.oasvalidation.Failed"
}
}
}


**_yaml file looks like:_**
![image](https://github.com/ajv-validator/ajv/assets/96113675/24675a05-6763-45f7-b689-eab3265d59b9)

![image](https://github.com/ajv-validator/ajv/assets/96113675/9664cd69-4743-451e-8fe3-b7af03196535)

**_json payload looks like:_**

--data '{ "billableHeader": { "sourceSystem": "UPSTREAM_APP", "sourceTransactionType": "INVOICE", "eventType": "BATCH", "messageCreationDatetime": "20220811140203", "timeZoneCode": "GMT", "isBulkProcessing": true, "product": "Airlcl" },