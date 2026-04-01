# [452] Accessing the Title keyword for a property from error object

Let's say I have a schema with a property called "full_name" and in my validation response I want to construct a custom, more user friendly error message. 

I want to display the words "Full Name" not the property name "full_name". In the spec it says I can put a Title keyword on the property, which would work perfectly, since the property would be called "full_name" with Title keyword "Full Name".

My question then is - how do I access this the Title keyword from the error object? It seems like I need to set the verbose flag and traverse the schema. Is this correct? or am I missing a trick ?