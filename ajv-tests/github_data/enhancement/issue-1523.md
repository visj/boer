# [1523] Option to generate ESM for standalone validators

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/docs/faq.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv you are you using?**

8.0.1

**What problem do you want to solve?**

Importing CommonJS modules creates non-ideal code when bundling with Rollup or Webpack and let them not participate in tree shaking. Code will be smaller and more efficient when ESM is used for bundling.
This will also gain in importance as npm packages will soon ship more and more ESM code.

**What do you think is the correct solution to problem?**

There are two parts to be done here:

1. Add an `esm` option to `ajv compile`/`standaloneCode`
2. Ship ESM versions of the runtime files and have an `exports` map for Bundles and Node.js to pick them up correctly.

The first change is the more important one but both are necessary for the full effect.

**Will you be able to implement it?**

I'm not sure. I started looking through the code a bit and I see how to get started but I expect to get stuck at some point. I'd definitely need help down the line.
