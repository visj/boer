# [569] Consider using an alternative to json-stable-stringify

Hello AJV team!

This is a feature request, sort of.

This library directly depends on `json-stable-stringify`, which depends on `jsonify`, which has no license and thus cause problems with corporations.

The maintainer of `json-stable-stringify`, who is also the maintainer of `jsonify`, basically is non responding on every PR that could fix this situation.

You can use a fork of the package such as https://www.npmjs.com/package/json-stable-stringify-without-jsonify or `fast-stable-stringify`. Or you could implement your own if you really need a stable stringify (the code isn't very large).

I'll be happy to provide either a PR to switch packages, or a PoC for implementing your own.

Cheers!