# [741] Flag to trim or not string field values before validating

**What version of Ajv you are you using?**
"ajv": "5.5.2"

**What problem do you want to solve?**
When validating string values trailing or leading white spaces  should not be counted in the field length nor only white spaces should be accepted as a value in certain scenarios.

**What do you think is the correct solution to problem?**
Have a flag global for the validator instance and local on the single fields (for strings mainly) to trim or not the value before validating them against the other rules.

**Will you be able to implement it?**
No, at the moment.
