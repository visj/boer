# [940] Reduce ajv code / bundle size

**What version of Ajv you are you using?**
6.8.1

**What problem do you want to solve?**
Browser bundle size

**What do you think is the correct solution to problem?**
Move functions/constants from shared template definitions into separate files (or reused templates)

**Plan**

- [x] Approve adding ajv-dist to cdnjs: https://github.com/cdnjs/cdnjs/issues/13315
- [x] Publish ajv-dist to npm
- [x] Submit PR  to update cdnjs to pull ajv bundles from ajv-dist https://github.com/cdnjs/cdnjs/pull/13316
- [x] Update ~~travis~~ script to publish ajv-dist to npm on every tag - done with GitHub action
- [x] Merge PR to update cdnjs to pull ajv bundles from ajv-dist https://github.com/cdnjs/cdnjs/pull/13316
- [x] Deprecate bundle (/dist) in this package
- [x] ~~Update docs with the new bundle URLs (or maybe the bundle URLs can stay? TBC - they will be the same)~~
- [x] in ajv 7.0 - remove bundles (/dist) from this package
