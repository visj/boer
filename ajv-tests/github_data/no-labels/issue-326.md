# [326] js-beautify is loaded synchronously via try-catch, which is problematic when trying to get BI about require errors

**What version of Ajv you are you using?**
3.4.0

**What problem do you want to solve?**
We use AJV at Wix.com (thank you!) and we configured our requirej.onError to notify us whenever a script failed to load in require. This helps us monitor issues with loading scripts for our users.

js-beautify is loaded synchronously via try-catch during the bootstrapping of the lib, and assumes that beautify will only exist if you want to use it (and you pass the responsibility of the consumer of AJV to load js-beautify before AJV is loaded).

If we don't want to use the beautify option, which we don't, then we have a require error trying to load this script.

**What do you think is the correct solution to problem?**
TLDR; require js-beautify lazily (but still synchronously), only if beautify option was specified.

Since you pass the responsibility of loading js-beautify to the consumer of AJV (and it must be loaded before AJV), I think that you should either:
- enable building a different (custom) bundle of AJV with options (beautify: false) so that it does not even try to require or use beautify (complex solution) 
- change API so consumer of AJV passes AJV the beautify function (probably a decent solution, but a bigger change)
- attempt to require js-beautify only if beautify:(true|options) was specified in the config, which is the only time beautify is used (much simpler). 

**Will you be able to implement it?**
Yes. I'll attach a PR here.
