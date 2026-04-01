# [680] Request: Smaller node_modules installed size

**What version of Ajv you are you using?**

6.0.1

**What problem do you want to solve?**

ajv appeared in my application because i use request, and request uses har-validator which uses this now. I was hunting down large modules in my application and ajv was one of the largest, with an installed footprint of 1.2MB. I looked at other json validators mentioned in the ajv readme and their installed size on disk were all around ~350kb (is-my-json-valid, djv, json-schema-validator-generator).

**What do you think is the correct solution to problem?**

As I am distributing my application as a bundled node executable using `pkg`, it would be nice if this module was under or around 350kb to be in line with the alternatives in terms of disk space.

**Will you be able to implement it?**

Not at this time