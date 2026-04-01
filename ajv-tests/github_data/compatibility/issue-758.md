# [758] Missing module property in package.json

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for compatibility issues.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**The version of Ajv you are using**
6.4.0

**The environment you have the problem with.**
Browser

**Your code (please make it as small as possible to reproduce the issue).**
Not a code problem.

The problem occurs when I try to minify my app assets in a reactjs env. The issue is described at [create-react-app](https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/template/README.md#npm-run-build-fails-to-minify).

There is a simple fix for it though. Just add the `module` property in `package.json`, alongside `main`, that points to `"dist/ajv.min.js"`.

Ideally, the `main` should point to the CommonJS dist file for nodejs compatibility (as the other party also suggests).

I can make a PR if needed.

**If your issue is in the browser, please list the other packages loaded in the page in the order they are loaded. Please check if the issue gets resolved (or results change) if you move Ajv bundle closer to the top.**

**Results in node.js v4.**

**Results and error messages in your platform.**
