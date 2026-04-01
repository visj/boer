# [1795] Generate source-map back to the source JSON files

Hi,

Thanks for this amazing library. It is a godsend for teams working with contract-first methodologies. :)

I have been testing a way to provide test suite that ensure that, on contract change (i.e. when a JSON schema is changed), no regression is created. It consists on having our contracts tested fully, and for that I call the AJV generated validation functions with as many test cases as needed to ensure that they are fully covered.

It is actually quite easy. The somewhat not perfect part is that the code coverage reported uncovered branches (for example) are from the generated function. It's OK, it's not that difficult to understand from the generated code what property from the JSON schema was not fully tested, but it would be much more comfortable if we could link back to the exact line and column in the JSON schema itself.

That's where a source-map is needed.

And here is my suggestion: AJV should be able to expose the source-map, from the original JSON files to the generated functions. I'm convinced that it is trivial since AJV is likely to be generating its code from the AST tree of the JSON schemas - so we basically know exactly from where a given JS code is generated from - but I'm wondering if it can be provided by an external package or if it could be added as an option to the AJV constructor itself.

Let me know what you think.
