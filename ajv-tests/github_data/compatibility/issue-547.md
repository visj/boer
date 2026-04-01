# [547] Webpack fails to parse json located in ./node_modules/ajv/lib/refs and thus fails to build my project when using Ajv 5.2.2

**The issue**

Webpack 3.5.3 appears to be unable to build my project when I use Ajv 5.2.2.  In particular, webpack appears to be unable to parse the json files located in ./node_modules/ajv/lib/refs.

**My code**

The error occurred as soon as I tried to instantiate an Ajv object.

```javascript
const Ajv = require('ajv');
export const Validator = new Ajv();
```

**Error I receive when trying to build my project with webpack 3.5.3**

```bash
ERROR in ./node_modules/ajv/lib/refs/$data.json
Module build failed: SyntaxError: Unexpected token, expected ; (2:13)

  1 | {
> 2 |     "$schema": "http://json-schema.org/draft-06/schema#",
    |              ^
  3 |     "$id": "https://raw.githubusercontent.com/epoberezkin/ajv/master/lib/refs/$data.json#",
  4 |     "description": "Meta-schema for $data reference (JSON-schema extension proposal)",
  5 |     "type": "object",

 @ ./node_modules/ajv/lib/ajv.js 415:18-46
 @ ./client/schema.jsx
 @ ./client/actions/login.jsx
 @ ./client/components/auth/Login.jsx
 @ ./client/components/App.jsx
 @ ./client/index.jsx

ERROR in ./node_modules/ajv/lib/refs/json-schema-draft-06.json
Module build failed: SyntaxError: Unexpected token, expected ; (2:13)

  1 | {
> 2 |     "$schema": "http://json-schema.org/draft-06/schema#",
    |              ^
  3 |     "$id": "http://json-schema.org/draft-06/schema#",
  4 |     "title": "Core schema meta-schema",
  5 |     "definitions": {

 @ ./node_modules/ajv/lib/ajv.js 419:19-62
 @ ./client/schema.jsx
 @ ./client/actions/login.jsx
 @ ./client/components/auth/Login.jsx
 @ ./client/components/App.jsx
 @ ./client/index.jsx
```
**My webpack.config.js**

```javascript
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = {
  devtool: 'source-map',
  entry: path.join(__dirname, 'client', 'index.jsx'),
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader',
        }),
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
      },
      {
        test: /\.html$/,
        loader: 'file?name=[name].[ext]',
      },
      {
        test: /\.jpg$/,
        loader: 'file-loader',
      },
      {
        test: /\.jsx?/,
        loader: 'babel-loader',
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
      },
      {
        test: /\.(woff|woff2)$/,
        loader: 'file-loader',
      },
    ],
  },
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'public'),
  },
  plugins: [
    new ExtractTextPlugin('bundle.css'),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
  ],
  resolve: {
    extensions: ['.webpack.js', '.web.js', '.jsx', '.js'],
    modules: ['node_modules', 'client'],
  },
  target: 'web',
};
```

**My package.json**

```json
{
  "name": "[some name]",
  "version": "0.1.0",
  "main": "webpack.config.js",
  "scripts": {
    "build": "webpack",
    "watch": "webpack --watch"
  },
  "repository": "[some place]",
  "author": "[me]",
  "license": "MIT",
  "devDependencies": {
    "babel-cli": "^6.24.1",
    "babel-core": "^6.25.0",
    "babel-eslint": "^7.2.3",
    "babel-loader": "^7.0.0",
    "babel-plugin-transform-class-properties": "^6.24.1",
    "babel-plugin-transform-decorators-legacy": "^1.3.4",
    "babel-plugin-transform-es2015-classes": "^6.24.1",
    "babel-plugin-transform-object-rest-spread": "^6.23.0",
    "babel-polyfill": "^6.23.0",
    "babel-preset-react": "^6.24.1",
    "babel-preset-stage-0": "^6.24.1",
    "css-loader": "^0.28.4",
    "eslint": "^4.4.1",
    "eslint-config-airbnb": "^15.1.0",
    "eslint-plugin-import": "^2.7.0",
    "eslint-plugin-jsx-a11y": "^6.0.2",
    "eslint-plugin-prettier": "^2.1.2",
    "eslint-plugin-react": "^7.2.0",
    "extract-text-webpack-plugin": "^3.0.0",
    "file-loader": "^0.11.2",
    "prettier": "^1.5.3",
    "style-loader": "^0.18.2",
    "webpack": "^3.5.3"
  },
  "dependencies": {
    "ajv": "^5.2.2",
    "axios": "^0.16.2",
    "bootstrap": "^3.3.7",
    "history": "^4.6.3",
    "jquery": "^3.2.1",
    "prop-types": "^15.5.10",
    "radium": "^0.19.4",
    "react": "^15.6.1",
    "react-dom": "^15.6.1",
    "react-media": "^1.6.1",
    "react-redux": "^5.0.5",
    "react-router": "^4.1.1",
    "react-router-dom": "^4.1.1",
    "react-router-redux": "next",
    "redux": "^3.7.1",
    "redux-devtools-extension": "^2.13.2",
    "redux-thunk": "^2.2.0"
  },
  "babel": {
    "presets": ["react", "stage-0"],
    "plugins": [
      "transform-class-properties",
      "transform-es2015-classes",
      "transform-decorators-legacy",
      "transform-object-rest-spread"
    ]
  }
}
```

**Are you going to resolve the issue?**

I'm afraid I don't know much about Javascript.  Just enough to get started on my first webapp.