# [662] Do not short-circuit anyOf with allErrors option

**Problem**

Allow some advanced logic for data validation based on annotation keywords etc.

**Solution**

Do not short-circuit anyOf keyword with allErrors: true option
Provide a separate option to override this behaviour (e.g. shortCircuit) that would override the default behaviour for allOf any anyOf.

Logic when keywords are short-circuited after the change (changed behaviour in bold):

|allErrors &rarr;<br>shortCircuit &darr;|false|true|
|---|:-:|:-:|
|undefined|allOf: short<br>anyOf: short|allOf: full<br>anyOf: **full**|
|false|allOf: **full**<br>anyOf: **full**|allOf: full<br>anyOf: **full**|
|true|allOf: short<br>anyOf: short|allOf: **short**<br>anyOf: short|

