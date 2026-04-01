# [646] Having a callback after each error that happened when `allErrors` is `true`

**What version of Ajv you are you using?**
 Version 4.11.7, can upgrade
**What problem do you want to solve?**
tl;dr; Having a callback after each error that happened when `allErrors` is `true`.
Imagine extremely big JSON to validate, I would like to have a callback on each error and decide what to do next: continue or cancel validation. 
**What do you think is the correct solution to problem?**
Having an option like `errorCallback`, which is function with single argument: an Ajv error. If function returns true - should continue validation, if returns false - should break validation and return the list of errors so far.
**Will you be able to implement it?**
With some assistance I think I would be able to do it.
