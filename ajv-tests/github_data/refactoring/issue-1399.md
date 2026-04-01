# [1399] Circular dependencies warning when using ajv@7.0.3

I'm upgrading a library to `ajv@7.0.3`, and rollup gives me the following warning:

```
(!) Circular dependencies
node_modules\ajv\dist\compile\validate\dataType.js -> node_modules\ajv\dist\compile\util.js -> node_modules\ajv\dist\compile\validate\index.js -> node_modules\ajv\dist\compile\validate\dataType.js
node_modules\ajv\dist\compile\validate\dataType.js -> node_modules\ajv\dist\compile\util.js -> node_modules\ajv\dist\compile\validate\index.js -> node_modules\ajv\dist\compile\validate\iterate.js -> node_modules\ajv\dist\compile\validate\dataType.js
node_modules\ajv\dist\compile\validate\index.js -> node_modules\ajv\dist\compile\validate\iterate.js -> node_modules\ajv\dist\compile\validate\defaults.js -> node_modules\ajv\dist\compile\validate\index.js
...and 10 more
```

It is no showstopper, but it would be great if the code would not contain these circular references.