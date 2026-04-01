# [1316] Optional property with format?

I have made a schema that defines a property needing type "string" and format "uri".

If the property is empty (simply `""`) then it fails the format check.

If I remove the format option, I can have a string, or empty string.

So how can I have a valid URI or empty string?