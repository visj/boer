# [2403] Implement x-inOrder subschema for in order or sequential processing 

**What problem do you want to solve?**

I want to solve the problem of serializing JSON data to XML, and the XML will comply with sequencing specified in XML schema.  In other words, I want to throw out JSON with a JSON schema where properties or subschemas do not match a certain ordering.

I would like to add an ‘x-inOrder’ subschema that applies to properties and subschemas, such that I will have a source of information for serializing properties to  XML elements, similar to head element and body element ordering in HTML.

**What do you think is the correct solution to problem?**

Implement something like allOf, anyOf, oneOf, but do sequential processing on it.

**Will you be able to implement it?**

I might need help understanding Ajv, but I am fairly competent at JavaScript.  I’m a long time Ajv user, and I’ve had a tiny bit of time looking at source to make it work on my platform.

I realize I can save this information elsewhere.  But I have collaborator that relies on JSON schema.
