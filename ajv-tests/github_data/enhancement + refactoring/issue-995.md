# [995] Improve Ajv.compile speed

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv you are you using?**

v6

**What problem do you want to solve?**

We are investigating [slow startup time in Fastify](https://github.com/fastify/fastify/issues/1598), and we identified this library as our primary bottleneck. We have been able to squeeze 30% by using ajv-pack in a couple of places.

Our current issue it is on how Ajv resolves URIs with https://www.npmjs.com/package/uri-js in https://github.com/epoberezkin/ajv/blob/bc993deceada5cc152ba0fd3b2e300012b2330a0/lib/compile/resolve.js#L235 and https://github.com/epoberezkin/ajv/blob/bc993deceada5cc152ba0fd3b2e300012b2330a0/lib/compile/resolve.js#L207-L216.


[![](https://upload.clinicjs.org/public/32ba5f97d5b2236fb85f50edcdd7dca62ae165eb587c64b1df3d3db5142e8a76/88053.clinic-flame.png)](https://upload.clinicjs.org/public/32ba5f97d5b2236fb85f50edcdd7dca62ae165eb587c64b1df3d3db5142e8a76/88053.clinic-flame.html#selectedNode=568&zoomedNode=&exclude=83c0&merged=true)


This is a flamegraph of the startup time. Apparently, the bottleneck is normalizing IPv6 addresses (which we are not using) in https://github.com/garycourt/uri-js/blob/4f6f600fade03398c08adf2755c3a2ad66d31b3c/src/uri.ts#L175.

Note that that RegExp is:

```js
/^\[?((?:(?:(?:(?:[0-9A-Fa-f]{1,4})\:){6}(?:(?:(?:[0-9A-Fa-f]{1,4})\:(?:[0-9A-Fa-f]{1,4}))|(?:(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9][0-9])|(?:0?[1-9][0-9])|0?0?[0-9])\.(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9][0-9])|(?:0?[1-9][0-9])|0?0?[0-9])\.(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9][0-9])|(?:0?[1-9][0-9])|0?0?[0-9])\.(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9][0-9])|(?:0?[1-9][0-9])|0?0?[0-9]))))|(?:\:\:(?:(?:[0-9A-Fa-f]{1,4})\:){5}(?:(?:(?:[0-9A-Fa-f]{1,4})\:(?:[0-9A-Fa-f]{1,4}))|(?:(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9][0-9])|(?:0?[1-9][0-9])|0?0?[0-9])\.(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9][0-9])|(?:0?[1-9][0-9])|0?0?[0-9])\.(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9][0-9])|(?:0?[1-9][0-9])|0?0?[0-9])\.(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9][0-9])|(?:0?[1-9][0-9])|0?0?[0-9]))))|(?:(?:(?:[0-9A-Fa-f]{1,4}))?\:\:(?:(?:[0-9A-Fa-f]{1,4})\:){4}(?:(?:(?:[0-9A-Fa-f]{1,4})\:(?:[0-9A-Fa-f]{1,4}))|(?:(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9][0-9])|(?:0?[1-9][0-9])|0?0?[0-9])\.(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9][0-9])|(?:0?[1-9][0-9])|0?0?[0-9])\.(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9][0-9])|(?:0?[1-9][0-9])|0?0?[0-9])\.(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9][0-9])|(?:0?[1-9][0-9])|0?0?[0-9]))))|(?:(?:(?:(?:[0-9A-Fa-f]{1,4})\:){0,1}(?:[0-9A-Fa-f]{1,4}))?\:\:(?:(?:[0-9A-Fa-f]{1,4})\:){3}(?:(?:(?:[0-9A-Fa-f]{1,4})\:(?:[0-9A-Fa-f]{1,4}))|(?:(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9][0-9])|(?:0?[1-9][0-9])|0?0?[0-9])\.(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9][0-9])|(?:0?[1-9][0-9])|0?0?[0-9])\.(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9][0-9])|(?:0?[1-9][0-9])|0?0?[0-9])\.(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9][0-9])|(?:0?[1-9][0-9])|0?0?[0-9]))))|(?:(?:(?:(?:[0-9A-Fa-f]{1,4})\:){0,2}(?:[0-9A-Fa-f]{1,4}))?\:\:(?:(?:[0-9A-Fa-f]{1,4})\:){2}(?:(?:(?:[0-9A-Fa-f]{1,4})\:(?:[0-9A-Fa-f]{1,4}))|(?:(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9][0-9])|(?:0?[1-9][0-9])|0?0?[0-9])\.(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9][0-9])|(?:0?[1-9][0-9])|0?0?[0-9])\.(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9][0-9])|(?:0?[1-9][0-9])|0?0?[0-9])\.(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9][0-9])|(?:0?[1-9][0-9])|0?0?[0-9]))))|(?:(?:(?:(?:[0-9A-Fa-f]{1,4})\:){0,3}(?:[0-9A-Fa-f]{1,4}))?\:\:(?:[0-9A-Fa-f]{1,4})\:(?:(?:(?:[0-9A-Fa-f]{1,4})\:(?:[0-9A-Fa-f]{1,4}))|(?:(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9][0-9])|(?:0?[1-9][0-9])|0?0?[0-9])\.(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9][0-9])|(?:0?[1-9][0-9])|0?0?[0-9])\.(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9][0-9])|(?:0?[1-9][0-9])|0?0?[0-9])\.(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9][0-9])|(?:0?[1-9][0-9])|0?0?[0-9]))))|(?:(?:(?:(?:[0-9A-Fa-f]{1,4})\:){0,4}(?:[0-9A-Fa-f]{1,4}))?\:\:(?:(?:(?:[0-9A-Fa-f]{1,4})\:(?:[0-9A-Fa-f]{1,4}))|(?:(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9][0-9])|(?:0?[1-9][0-9])|0?0?[0-9])\.(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9][0-9])|(?:0?[1-9][0-9])|0?0?[0-9])\.(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9][0-9])|(?:0?[1-9][0-9])|0?0?[0-9])\.(?:(?:25[0-5])|(?:2[0-4][0-9])|(?:1[0-9][0-9])|(?:0?[1-9][0-9])|0?0?[0-9]))))|(?:(?:(?:(?:[0-9A-Fa-f]{1,4})\:){0,5}(?:[0-9A-Fa-f]{1,4}))?\:\:(?:[0-9A-Fa-f]{1,4}))|(?:(?:(?:(?:[0-9A-Fa-f]{1,4})\:){0,6}(?:[0-9A-Fa-f]{1,4}))?\:\:)))(?:(?:\%25|\%(?![0-9A-Fa-f]{2}))((?:(?:[A-Za-z0-9\-\.\_\~\xA0-\u200D\u2010-\u2029\u202F-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|(?:(?:%[EFef][0-9A-Fa-f]%[0-9A-Fa-f][0-9A-Fa-f]%[0-9A-Fa-f][0-9A-Fa-f])|(?:%[89A-Fa-f][0-9A-Fa-f]%[0-9A-Fa-f][0-9A-Fa-f])|(?:%[0-9A-Fa-f][0-9A-Fa-f])))+)))?\]?$/
```

This PR is costly to evaluate at a 5-10ms each time on my machine (Node 10)

**What do you think is the correct solution to problem?**

Faster startup time.

**Will you be able to implement it?**

Yes and no. We can do the work, but we need to identify where and what to do. Would you be open to a refactor of https://github.com/epoberezkin/ajv/blob/bc993deceada5cc152ba0fd3b2e300012b2330a0/lib/compile/resolve.js#L235 and https://github.com/epoberezkin/ajv/blob/bc993deceada5cc152ba0fd3b2e300012b2330a0/lib/compile/resolve.js#L207-L216 so that we just extract the relevant part?
Alternatively do you recommend opening up an issue on URI.js to simplify/rework that regexp?