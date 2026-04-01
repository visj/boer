# [95] Option to allow type coercion/cast/type conversion.

Hi there - 

Thanks so much for writing this fantastic validator!

I'm using it for POSTed forms with checkboxes and other cases where basically I'd love to support conversion to a different type from a string and (as long as conversion from string works) changing the object in place, allowing validation to continue without errors. 

I realize this is a corruption of pure validation and there would be a performance hit but I suspect there are others out there that would like coercion to work as well. An option to 'allowTypeCoercion' or 'laxMode' could allow transformation of primitives like integers, floats and boolean when a 'string' is found.

In the absence of support for this - I'm doing validation of the request.body with string types - and then if I need them manually converting each string to a primitive or other type. Beyond requiring additional code in which there's opportunity for inconsistencies with the schema - errors are found further downstream which we need to ripple upward. Support for this via an attribute would eliminate a bunch of redundant code... 

It looks like the best I can do currently is to specify a string 'format' to try to enforce a numeric value for example or perhaps an enum to enforce the string 'true', 'false' in the case of a boolean. I might be able to use keywords as described in your documentation to try to make this more consistent.

Am I missing something that would allow conversion or support this in a more elegant way?  Are there others interested in this sort of thing?

Thanks in advance,
-Darrin
