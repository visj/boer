# [261] date-time full format validation error on date-only strings

Hello and thanks for the great lib!

I found an issue validating a date-time string format against date-only strings like '2016-08-04'. The error is:

`TypeError: Cannot read property 'match' of undefined in lib/compile/formats.js:93`

It seems the date_time function splits by the time separator and passes the second part to time function which calls match on the string but string is undefined in the above use-case. Will submit a PR with a possible fix...
