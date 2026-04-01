# [285] Add support for absolute JSON Pointers in the $data reference

**What version of Ajv you are you using?**
4.5.0
**What problem do you want to solve?**
The $data reference only supports relative JSON pointers, which limits code reuse for data that is always in one location but $data referenced in multiple places. It also creates problems for more complex schemas; for example, a recursive schema can't reference data in the root of the document because it's relative distance to the root changes depending on how many levels deep you've gone. 
**What do you think is the correct solution to problem?**
Add in support for regular (absolute) JSON pointers to the $data reference. I have an issue open on the JSON-Schema Github for adding this to the v5 proposal (https://github.com/json-schema-org/json-schema-spec/issues/40) that explains the issue in a bit more depth. The short version is, regular JSON pointers start with a / instead of a number, and the pointer is always anchored to the root of the document, which solves the problem. Additionally, since relative pointers ALWAYS start with a number, there's no ambiguity as to which type of pointer you're trying to use. 
**Will you be able to implement it?**
I couldn't find where the code for handling the relative pointers is located, but point me in the right direction and I might be able to. However, the $data reference looks like some of the more complicated parts of the library, so I can't say for sure. 
