# [396] Allow underscores in email domains

We're using ajv to validate customer data.
We have quite a few records which have an underscore in the domain part of the email address: `example@my_domain.com`

I have done a bit of research and it seems like ajv uses the regex mentioned in the HTML 5 specification. According to this, underscores are not allowed in the domain.
However in practise these email addresses are used and they do work (because underscores are allowed in dns entries).

Given my use case, the appropriate action is to be lenient and accept these email addresses.

I am mainly creating this issue to see whether it is worth opening a PR with the changed regex.