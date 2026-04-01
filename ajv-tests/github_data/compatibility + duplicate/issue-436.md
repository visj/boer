# [436] Webpack build failing

A few files are being loaded that are rejected by webpack builds.

```
WARNING in ./~/ajv/lib/async.js
Critical dependencies:
96:20-33 the request of a dependency is an expression
119:15-28 the request of a dependency is an expression
 @ ./~/ajv/lib/async.js 96:20-33 119:15-28

WARNING in ./~/ajv/lib/compile/index.js
Critical dependencies:
13:21-34 the request of a dependency is an expression
 @ ./~/ajv/lib/compile/index.js 13:21-34

WARNING in ./~/ajv/lib/ajv.d.ts
Module parse failed: C:\Users\jkornblum\Documents\GitHub\nteract\node_modules\ajv\lib\ajv.d.                 ts Unexpected token (1:8)
You may need an appropriate loader to handle this file type.
SyntaxError: Unexpected token (1:8)
    at Parser.pp$4.raise (C:\Users\jkornblum\Documents\GitHub\nteract\node_modules\webpack\n                 ode_modules\acorn\dist\acorn.js:2221:15)
    at Parser.pp.unexpected (C:\Users\jkornblum\Documents\GitHub\nteract\node_modules\webpac                 k\node_modules\acorn\dist\acorn.js:603:10)
    at Parser.pp.semicolon (C:\Users\jkornblum\Documents\GitHub\nteract\node_modules\webpack                 \node_modules\acorn\dist\acorn.js:581:61)
    at Parser.pp$1.parseExpressionStatement (C:\Users\jkornblum\Documents\GitHub\nteract\nod                 e_modules\webpack\node_modules\acorn\dist\acorn.js:966:10)
    at Parser.pp$1.parseStatement (C:\Users\jkornblum\Documents\GitHub\nteract\node_modules\                 webpack\node_modules\acorn\dist\acorn.js:730:24)
    at Parser.pp$1.parseTopLevel (C:\Users\jkornblum\Documents\GitHub\nteract\node_modules\w                 ebpack\node_modules\acorn\dist\acorn.js:638:25)
    at Parser.parse (C:\Users\jkornblum\Documents\GitHub\nteract\node_modules\webpack\node_m                 odules\acorn\dist\acorn.js:516:17)
    at Object.parse (C:\Users\jkornblum\Documents\GitHub\nteract\node_modules\webpack\node_m                 odules\acorn\dist\acorn.js:3098:39)
    at Parser.parse (C:\Users\jkornblum\Documents\GitHub\nteract\node_modules\webpack\lib\Pa                 rser.js:902:15)
    at DependenciesBlock.<anonymous> (C:\Users\jkornblum\Documents\GitHub\nteract\node_modul                 es\webpack\lib\NormalModule.js:104:16)
    at DependenciesBlock.onModuleBuild (C:\Users\jkornblum\Documents\GitHub\nteract\node_mod                 ules\webpack-core\lib\NormalModuleMixin.js:310:10)
    at nextLoader (C:\Users\jkornblum\Documents\GitHub\nteract\node_modules\webpack-core\lib                 \NormalModuleMixin.js:275:25)
    at C:\Users\jkornblum\Documents\GitHub\nteract\node_modules\webpack-core\lib\NormalModul                 eMixin.js:259:5
    at Storage.finished (C:\Users\jkornblum\Documents\GitHub\nteract\node_modules\enhanced-r                 esolve\lib\CachedInputFileSystem.js:38:16)
    at C:\Users\jkornblum\Documents\GitHub\nteract\node_modules\graceful-fs\graceful-fs.js:7                 8:16
    at FSReqWrap.readFileAfterClose [as oncomplete] (fs.js:445:3)
 @ ./~/ajv/lib ^\.\/.*$
```

Xref: https://github.com/nteract/nteract/issues/1545