# [453] Fix Webpack issues in v4?

Why are the require(name) pattern even used?

If I change it to require('nodent') for example, webpack stops complaining.

I feel a bit stuck in that we have no control over our ajv version in our product, as it's used by our dependencies. So it's not as simple as "use v5"

Can we backport the removal of "webpack: bundle.js blah" to v4 and change the requires to require('regenerator') instead of require('name') ?
