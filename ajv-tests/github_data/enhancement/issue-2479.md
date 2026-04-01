# [2479] Add `sideEffects: false` flag to `package.json` to allow tree-shaking

I have a library that amongst others exports a utility function `createAjvValidator ` that uses `ajv`. Now, not all users of my library use this utility function, but I noticed that the Ajv library is always included when creating a js bundle containing my library, also when the ajv utility function is not used at all. It turns out that tree-shaking is not working.

Can the flag `"sideEffects": false` be added to the `package.json` file of `ajv`? That will enable tree shaking by Vite/Rollup/Webpack out of the box.

See:

- https://webpack.js.org/guides/tree-shaking/#mark-the-file-as-side-effect-free
- https://github.com/rollup/rollup/issues/2593