# [2446] 8.15 requires fast-uri, which requires `node:url`, which makes it not bundelable for the web

**edit: please stop posting "+1". The team is on it, the problem is reproducible, you're not adding useful information by posting "+1", and everyone in the thread is getting spurious mail updates**.

If you are commenting because you want updates, see the big "subscribe" button to the right. If you want to mark yourself as affected, click the counting emoji below this post.

---

**The version of Ajv you are using**
8.15.0

**The environment you have the problem with**
esbuild, targeted to Firefox (but I believe this will be a problem for all browsers)

**Your code (please make it as small as possible to reproduce the issue)**
```
import AJV from 'ajv'
```

**Results in node.js v8+**
this works, because `node:url` is a native node module

