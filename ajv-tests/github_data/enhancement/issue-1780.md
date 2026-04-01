# [1780] JTDDataType and parseDate

**What version of Ajv you are you using?**

8.6.3

**What problem do you want to solve?**

While `allowDate` and `parseDate` will parse and serialize `Date` objects, `JTDDataType` always return `string | Date` type for `timestamp`.

It will lead to errors when you assign a field of type `JTDDataType<...>['date_field'] = string | Date` to a single field with either `string` or `Date` type.

**What do you think is the correct solution to problem?**

A helper option in `JTDDataType` like `JTDDataType<..., {timestamp: "date"}>`.

Or differential `string` or `Date` timestamp by two types. 

**Will you be able to implement it?**

No