# [912] New option to enhance default functionality

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv you are you using?**
6.6.1

**What problem do you want to solve?**
When submitting HTML forms, the url-encoded data will send empty strings for fields that are empty.  The joi library has functionality to default empty strings, and I would like to see this same functionality implemented in ajv.

> However, if you want to specify a default value in case of empty string you have to use a different pattern: Joi.string().empty('').default('default value').

**What do you think is the correct solution to problem?**
Maybe a new enum for the useDefaults option like "emptyValues".  The default logic needs to be modified to be executed for all properties regardless of the property's absence or current value if a default annotation is present in the schema for that property.  The default logic needs to mutate the data if the property is missing or has an "emptyValue" before being validated against the property format.

**Will you be able to implement it?**
Probably not, but I'd love to learn.

*Question*
Is it worth also enhancing defaults for null, empty array [], empty object {}, zero 0?

*Examples*
*Defaulting an empty string to a numeric value.*
```
{
   Product: "10mm Wood Screw",
   Quantity: ""
}
//Schema has default: 0 for Quantity
{
   Product: "10mm Wood Screw",
   Quantity: 0
}
```

*Defaulting a zero value to a different value*
```
{
   Model: "2018 Tesla Model S",
   BatteryCapacity: 0
}
//Default in schema is 85 kilowatt hours
{
   Model: "2018 Tesla"
   BatteryCapacity: 85
}
```