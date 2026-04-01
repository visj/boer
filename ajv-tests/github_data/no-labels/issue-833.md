# [833] AJV 6.5.2 is not IE11 compatible as it still depends on uri-js version 4.2.1 instead of 4.2.2

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

4.5.2 / yes

**The problem**

Ajv 4.5.2 depends on uri-js version `^4.2.1`. This version of uri-js had the problem that it forced packers to use the "esnext" dist instead - as previous versions - the es5 version. This lead into breaking IE11 compatibility. Regarding the uri-js project they fixed the issue with uri-js version 4.2.2. Ajv still uses depends on the broken version 4.2.1 even if they released 4.2.2 some months ago.

So after upgrading our projects to the latest AJV (4.5.2) it crashes in IE 11 because esnext-code of uri-js gets picked up.

See [this issue](https://github.com/garycourt/uri-js/issues/24) over at uri-js for more information. Especially the last 2-3 comments.

**Expected**

Expect to get the ES5 code of uri-js which should be true if AJV depends on the 4.2.2 patch of uri-js. If AJV claims to be IE11 / ES5 compatible it should fix this dependency so the workaround below is not required to use AJV with ES5.

**Workaround**

In the app's package.json one can add a dependency to uri-js version ^4.2.2 which will then force NPM/yarn to use the patched version of uri.js. But this is a workaround as the app itself does not require this library.