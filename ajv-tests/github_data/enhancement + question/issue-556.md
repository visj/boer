# [556] request better error handling with deeply nested oneOf's, version 5.2.2


[schema.txt](https://github.com/epoberezkin/ajv/files/1277024/schema.txt)

[X3dHeaderPrototypeSyntaxExamples.txt](https://github.com/epoberezkin/ajv/files/1277026/X3dHeaderPrototypeSyntaxExamples.txt)

I believe I am seeing massive numbers of errors come up when the inner oneOf of many nested oneOf's is invalid, all the way up. I believe the error should be localized to where the oneOf that is invalid.   See attached schema.txt and associated JSON file (as a txt).