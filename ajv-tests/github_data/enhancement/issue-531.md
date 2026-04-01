# [531] Missing `util.unescapeJsonPointer`

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

4.11.8 or 5.2.0.


**What results did you expect?**

`util.unescapeJsonPointer` documented at https://github.com/epoberezkin/ajv/blob/master/CUSTOM.md#unescapejsonpointer-string-str---string is missing. It problably would go after this line https://github.com/epoberezkin/ajv/blob/0a1c57eede67102a229eb18c98e6e7881f0f2244/lib/compile/util.js#L24


**Are you going to resolve the issue?**

I can do it, though this is so small that maybe a pull request just for it is overkill.