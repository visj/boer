# [1615] Error: Keyword 0 is not a valid identifier

ajv version with bug: 6.12.6
works without this bug on version: 6.10.2

When I pass keywords as `["typeof"]`, it fails with `Error: Keyword 0 is not a valid identifier`

this is the change that causes the issue:
https://github.com/ajv-validator/ajv/compare/v6.10.2...v6.12.6#diff-b6fa9229efcb357261c6326aec2d14f9022d4b466e145a8517a307adfbc0ebf2R72

github seems to not lead to the line with the link above, so the line is there: `lib/ajv.js:72`