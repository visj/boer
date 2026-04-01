# [931] AJV Clone, npm install - error

Hi,

I clone from your master locally,
do "npm install"

saying:
```
...
$ npm install
npm WARN prepublish-on-install As of npm@5, `prepublish` scripts are deprecated.
npm WARN prepublish-on-install Use `prepare` for build steps and `prepublishOnly` for upload-only.
npm WARN prepublish-on-install See the deprecation note in `npm help scripts` for more information.

> ajv@6.8.1 prepublish D:\temp\ajv_O
> npm run build && npm run bundle


> ajv@6.8.1 build D:\temp\ajv_O
> del-cli lib/dotjs/*.js '!lib/dotjs/index.js' && node scripts/compile-dots.js



Compiling:
compiled _limit
compiled _limitItems
......
compiled required
compiled uniqueItems
compiled validate

> ajv@6.8.1 bundle D:\temp\ajv_O
> del-cli dist && node ./scripts/bundle.js . Ajv pure_getters

browserify error: { Error: Cannot find module '../dotjs' from 'D:\temp\ajv_O\lib\compile'
    at D:\temp\ajv_O\node_modules\browser-resolve\node_modules\resolve\lib\async.js:55:21
    at load (D:\temp\ajv_O\node_modules\browser-resolve\node_modules\resolve\lib\async.js:69:43)
    at onex (D:\temp\ajv_O\node_modules\browser-resolve\node_modules\resolve\lib\async.js:92:31)
    at D:\temp\ajv_O\node_modules\browser-resolve\node_modules\resolve\lib\async.js:22:47
    at FSReqWrap.oncomplete (fs.js:152:21)
  stream:
   Labeled {
     _readableState:

....

npm ERR! code ELIFECYCLE
npm ERR! errno 1
npm ERR! ajv@6.8.1 bundle: `del-cli dist && node ./scripts/bundle.js . Ajv pure_getters`
npm ERR! Exit status 1
npm ERR!
npm ERR! Failed at the ajv@6.8.1 bundle script.
npm ERR! This is probably not a problem with npm. There is likely additional logging output above.

npm ERR! A complete log of this run can be found in:
npm ERR!     C:\Users\michaell\AppData\Roaming\npm-cache\_logs\2019-02-05T08_26_12_118Z-debug.log
npm ERR! code ELIFECYCLE
npm ERR! errno 1
npm ERR! ajv@6.8.1 prepublish: `npm run build && npm run bundle`
npm ERR! Exit status 1
npm ERR!
npm ERR! Failed at the ajv@6.8.1 prepublish script.
npm ERR! This is probably not a problem with npm. There is likely additional logging output above.

npm ERR! A complete log of this run can be found in:
npm ERR!     C:\Users\michaell\AppData\Roaming\npm-cache\_logs\2019-02-05T08_26_12_164Z-debug.log
```

is it something i do wrong or master is currently not working?