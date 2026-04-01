# [2535] Cannot find module 'ajv/dist/compile/codegen'

=> Failed to build the preview
Error: Cannot find module 'ajv/dist/compile/codegen'
Require stack:
- .\node_modules\ajv-keywords\dist\definitions\typeof.js
- .\node_modules\ajv-keywords\dist\keywords\typeof.js
- .\node_modules\ajv-keywords\dist\keywords\index.js
- .\node_modules\ajv-keywords\dist\index.js
- .\node_modules\schema-utils\dist\validate.js
- .\node_modules\schema-utils\dist\index.js
- .\node_modules\@storybook\builder-webpack5\node_modules\webpack-dev-middleware\dist\index.js
- .\node_modules\@storybook\builder-webpack5\dist\index.js
- .\node_modules\@storybook\react-webpack5\dist\preset.js
- .\node_modules\@storybook\react-webpack5\preset.js
- .\node_modules\@storybook\core\dist\common\index.cjs
- .\node_modules\storybook\dist\proxy.cjs
- .\node_modules\storybook\bin\index.cjs
    at Module._resolveFilename (node:internal/modules/cjs/loader:1140:15)
    at Module._resolveFilename (.\node_modules\esbuild-register\dist\node.js:4794:36)
    at Module._load (node:internal/modules/cjs/loader:981:27)
    at Module.require (node:internal/modules/cjs/loader:1231:19)
    at require (node:internal/modules/helpers:177:18)
    at Object.<anonymous> (.\node_modules\ajv-keywords\src\definitions\typeof.ts:2:1)
    at Module._compile (node:internal/modules/cjs/loader:1364:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1422:10)
    at Object.newLoader (.\node_modules\esbuild-register\dist\node.js:2262:9)
    at extensions..js (.\node_modules\esbuild-register\dist\node.js:4833:24)

WARN Broken build, fix the error above.
WARN You may need to refresh the browser.