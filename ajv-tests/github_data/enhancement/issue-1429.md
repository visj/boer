# [1429] Feature request: add auto-decoding of numerical arrays into Typed arrays

**What version of Ajv you are you using?**
Latest

**What problem do you want to solve?**
When numerical arrays need to be decoded from a JSON schema, we can specify in Ajv "array of integers" or "array of numbers" for instance.

With the newest versions of JavaScript, Typed arrays (Float64Array, etc.) are existing, and provide an enormous performance boost when iterating over the numbers, but are not used yet by Ajv, while thanks to the JSON schema enforcing the content of these arrays, it could be the case.

This would:
- Allow applications which care about performances to not convert manually Avj-generated arrays to Typed arrays, thus avoiding double memory allocation and improving performances
- Allow applications which do not care about performances to have a automagic boost of performances

**What do you think is the correct solution to problem?**
Because this is the way JavaScript manages these arrays.

**Will you be able to implement it?**
Unfortunatelty, my knowledge of JavaScript is not that up to par.

I understand that for backward compatibility, and to allow people choosing the decoding mode they prefer, it is surely needed to add a new Ajv options.

I also understand that if support for older JavaScript versions is needed, it is needed to override this option with the effective capability of the JavaScript engine used to support Typed arrays.

But that's all at this point.