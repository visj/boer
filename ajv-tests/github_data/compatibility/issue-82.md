# [82] Webpack compatibility

Awesome stuff! Thanks!

Webpack doesn't like this line: [https://github.com/epoberezkin/ajv/blob/master/lib/ajv.js#L294](https://github.com/epoberezkin/ajv/blob/master/lib/ajv.js#L294)

Webpack can `require()` .json-files, but it needs an explicit [https://github.com/webpack/json-loader](https://github.com/webpack/json-loader), and a different syntax e.g. `require('json!./refs/json-schema-draft-04.json');`

I can't work around this issue by setting `metaSchema` explicitly, since Webpack simply will not parse and process ajv ....
