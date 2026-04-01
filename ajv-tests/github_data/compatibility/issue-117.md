# [117] Building with Webpack causes spurious warnings

It is being caused by this line:

https://github.com/epoberezkin/ajv/blob/3.5.0/lib/compile/index.js#L10

Is there a cleaner way to manage this dependency? Is `peerDependencies` built for this?

Error stack below:

```
./~/ajv/lib/compile/index.js
Module not found: Error: Cannot resolve module 'js-beautify' in /app/myapp/node_modules/ajv/lib/compile
resolve module js-beautify in /app/myapp/node_modules/ajv/lib/compile
  looking for modules in /app/myapp/node_modules
    /app/myapp/node_modules/js-beautify doesn't exist (module as directory)
    resolve 'file' js-beautify in /app/myapp/node_modules
      resolve file
        /app/myapp/node_modules/js-beautify doesn't exist
        /app/myapp/node_modules/js-beautify.webpack.js doesn't exist
        /app/myapp/node_modules/js-beautify.web.js doesn't exist
        /app/myapp/node_modules/js-beautify.js doesn't exist
        /app/myapp/node_modules/js-beautify.json doesn't exist
  looking for modules in /app/myapp/public/js
    /app/myapp/public/js/js-beautify doesn't exist (module as directory)
    resolve 'file' js-beautify in /app/myapp/public/js
      resolve file
        /app/myapp/public/js/js-beautify doesn't exist
        /app/myapp/public/js/js-beautify.webpack.js doesn't exist
        /app/myapp/public/js/js-beautify.web.js doesn't exist
        /app/myapp/public/js/js-beautify.js doesn't exist
        /app/myapp/public/js/js-beautify.json doesn't exist
  looking for modules in /app/myapp/public/css
    /app/myapp/public/css/js-beautify doesn't exist (module as directory)
    resolve 'file' js-beautify in /app/myapp/public/css
      resolve file
        /app/myapp/public/css/js-beautify doesn't exist
        /app/myapp/public/css/js-beautify.webpack.js doesn't exist
        /app/myapp/public/css/js-beautify.web.js doesn't exist
        /app/myapp/public/css/js-beautify.js doesn't exist
        /app/myapp/public/css/js-beautify.json doesn't exist
[/app/myapp/node_modules/js-beautify]
[/app/myapp/node_modules/js-beautify]
[/app/myapp/node_modules/js-beautify.webpack.js]
[/app/myapp/node_modules/js-beautify.web.js]
[/app/myapp/node_modules/js-beautify.js]
[/app/myapp/node_modules/js-beautify.json]
[/app/myapp/public/js/js-beautify]
[/app/myapp/public/js/js-beautify]
[/app/myapp/public/js/js-beautify.webpack.js]
[/app/myapp/public/js/js-beautify.web.js]
[/app/myapp/public/js/js-beautify.js]
[/app/myapp/public/js/js-beautify.json]
[/app/myapp/public/css/js-beautify]
[/app/myapp/public/css/js-beautify]
[/app/myapp/public/css/js-beautify.webpack.js]
[/app/myapp/public/css/js-beautify.web.js]
[/app/myapp/public/css/js-beautify.js]
[/app/myapp/public/css/js-beautify.json]
 @ ./~/ajv/lib/compile/index.js 8:42-69
```
