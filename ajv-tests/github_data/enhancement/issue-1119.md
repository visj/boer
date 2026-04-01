# [1119] Support OpenAPI discriminator keyword together with oneOf

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What problem do you want to solve?**

- [ ] Optimise oneOf validation in case discriminator keyword is present by only validating the matching branch (currently all branches are validated)
- [ ] Apply defaults inside of oneOf in the presence of discriminator keyword (currently defaults inside oneOf are ignored)

The second can be addressed separately

**The solution requirements?**

- [ ] requires an option "discriminator" to enable "discriminator" keyword
- [ ] discriminator without oneOf should throw exception at schema compilation in strictKeywords mode, log warning and be ignored otherwise
- [ ] validate that each oneOf branch can only be valid for one discriminator value - TBC, possibly depending on strictKeywords or another option (i.e. that from validation result point of view discriminator remains no-op)
- [ ] apply defaults from the chosen oneOf branch
- [ ] tests:
  - [ ] that the current behaviour is not affected (i.e. all oneOf branches are validated in case discrimintator keyword is absent or present without an option/with option false and that the defaults in oneOf are ignored)
  - [ ] all the new behaviours


**Will you be able to implement it?**

Yes, with the right incentive :) PR is welcome.