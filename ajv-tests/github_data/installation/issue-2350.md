# [2350] Deprecation Warning: punycode Dependency via uri-js

Version 8.12.0, Node 21.2.0, using npm.

Hi there,
I wanted to raise an issue regarding `uri-js` dependency, which uses `punycode` under the hood, which has been deprecated.

While working with ajv, I've noticed deprecation warnings related to the usage of the `punycode` module through its dependency on uri-js. It seems uri-js hasn't been updated for three years, causing these warnings.

├─┬ ajv@8.12.0
│ └─┬ uri-js@4.4.1
│   └── punycode@2.3.0

Just thought I'd bring this up for consideration. Thank you for your work on ajv!
