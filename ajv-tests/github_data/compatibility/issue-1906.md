# [1906] AJV as a dependency of storybook-addon-headless fails to bundle with webpack

This issue specifically pertains to bundling my app using webpack where AJV is a dependency on the storybook addon.
When performing this I am getting the following errors. My guess is something to do with the setup of my app, some sort of transpiling issue... but I am unsure at this point. 
I have logged a bug with the maintainer of storybook-addon-headless also. 

Steps to reproduce the behavior:

- install storybook-addon-headless via npm
- add to project via /.storybook/main.js
- serve the project using webpack devserver npx webpack serve --config webpack.dev.js

Expected behavior
Project gets bundled without issue and dependencies are handled correctly, and serves up the bundle.

Screenshots / Bundle output
```
ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/compile/codegen/code.ts
52:4-89
[tsl] ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/compile/codegen/code.ts(52,5)
      TS2322: Type 'CodeItem' is not assignable to type 'string'.

ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/compile/codegen/code.ts
52:12-21
[tsl] ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/compile/codegen/code.ts(52,13)
      TS2322: Type 'CodeItem' is not assignable to type 'string'.
  Type 'number' is not assignable to type 'string'.

ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/compile/codegen/code.ts
139:2-141:55
[tsl] ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/compile/codegen/code.ts(139,3)
      TS2322: Type 'string | number | boolean | string[]' is not assignable to type 'string | SafeExpr'.
  Type 'string[]' is not assignable to type 'string | SafeExpr'.
    Type 'string[]' is not assignable to type 'string'.

ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/core.ts
371:2-9
[tsl] ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/core.ts(371,3)
      TS2394: This overload signature is not compatible with its implementation signature.

ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/core.ts
371:2-9
[tsl] ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/core.ts(371,3)
      TS2394: This overload signature is not compatible with its implementation signature.

ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/core.ts
371:2-9
[tsl] ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/core.ts(371,3)
      TS2394: This overload signature is not compatible with its implementation signature.

ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/core.ts
371:2-9
[tsl] ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/core.ts(371,3)
      TS2394: This overload signature is not compatible with its implementation signature.

ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/core.ts
371:2-9
[tsl] ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/core.ts(371,3)
      TS2394: This overload signature is not compatible with its implementation signature.

ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/core.ts
371:2-9
[tsl] ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/core.ts(371,3)
      TS2394: This overload signature is not compatible with its implementation signature.

ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/core.ts
371:2-9
[tsl] ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/core.ts(371,3)
      TS2394: This overload signature is not compatible with its implementation signature.

ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/core.ts
393:2-14
[tsl] ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/core.ts(393,3)
      TS2394: This overload signature is not compatible with its implementation signature.

ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/core.ts
393:2-14
[tsl] ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/core.ts(393,3)
      TS2394: This overload signature is not compatible with its implementation signature.

ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/core.ts
393:2-14
[tsl] ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/core.ts(393,3)
      TS2394: This overload signature is not compatible with its implementation signature.

ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/core.ts
393:2-14
[tsl] ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/core.ts(393,3)
      TS2394: This overload signature is not compatible with its implementation signature.

ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/core.ts
393:2-14
[tsl] ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/core.ts(393,3)
      TS2394: This overload signature is not compatible with its implementation signature.

ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/core.ts
393:2-14
[tsl] ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/core.ts(393,3)
      TS2394: This overload signature is not compatible with its implementation signature.

ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/compile/resolve.ts
102:2-10
[tsl] ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/compile/resolve.ts(102,3)
      TS2349: This expression is not callable.
  Type '{ default: { (schema: SchemaObject, opts: Options, cb?: Callback): void; (schema: SchemaObject, cb: Callback): void; }; }' has no call signatures.

ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/compile/resolve.ts
143:31-36
[tsl] ERROR in [redacted]/node_modules/storybook-addon-headless/node_modules/ajv/lib/compile/resolve.ts(143,32)
      TS2349: This expression is not callable.
  Type '{ default: (a: any, b: any) => boolean; }' has no call signatures.
```
webpack.dev.js
```
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { merge } = require('webpack-merge');
const config = require('./webpack.common.js');

module.exports = merge(config, {
  devtool: 'inline-source-map',
  entry: path.join(__dirname, 'dev', 'index.tsx'),
  output: {
    path: path.join(__dirname, '.sandbox'),
    filename: 'frontend.js',
    chunkFilename: '[name].[chunkhash].js',
    publicPath: '/',
    clean: true,
  },
  performance: {
    hints: false,
  },
  devServer: {
    hot: false,
    liveReload: false,
    compress: true,
    port: 8090,
  },
  plugins: [
    new webpack.DefinePlugin({
      SERVICE_HOSTNAME: JSON.stringify(process.env.SERVICE_HOSTNAME || 'http://localhost:8089'),
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'dev/index.html',
    }),
  ],
});
```
webpack.common.js
```
const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    symlinks: false,
    alias: {
      '@src': path.resolve('./src'),
      '@libs': path.resolve('./src/libs'),
      '@public': path.resolve('./src/public'),
      '@components': path.resolve('./src/components'),
      '@endpoints': path.resolve('./src/endpoints'),
      '@reducers': path.resolve('./src/reducers'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jp(e*)g|svg|gif)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'images/[hash]-[name].[ext]',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      SERVICE_NAME: JSON.stringify(process.env.SERVICE_NAME),
      SERVICE_SDK_NAME: JSON.stringify(process.env.SERVICE_SDK_NAME),
    }),
  ],
};
```

OS: iOS 11.6.2 (Big Sur)
Browser: Chrome
Version: 97.0.4692.99 (Official Build) (arm64)

Additional context
Webpack 5.66.0
storybook-addon-headless 2.1.3
typescript 4.5.4
ts-loader 9.2.6
storybook-react 6.4.19
