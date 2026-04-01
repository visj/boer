# [22] final validation function and $refs

I have two feature requests that may not be standards based but I think they'll be really useful:

1- An ajv function/method that can be provided with input data and returns TRUE or FALSE based on the input data as a first/final check, since there still are some things missing from JSON schema (or perhaps impossible the way I've written the schemas now).

2- A function that'd print the final JSON schema after replacing all $refs with actual content (ie. referenced schemas).

You can print warnings etc when they are used, so users know what they are doing.
