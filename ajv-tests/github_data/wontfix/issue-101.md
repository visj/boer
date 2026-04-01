# [101] Allowing regex patterns to specify flags (e.g. case insensitive, global, etc)

# Summary

Using flags in string regexs would be VERY useful in situations where you'd like to reuse a community regex that's slightly tweaked. Passing a string as a regex generally means that you loose the ability to specify [Javascript Regex Modfiers](http://www.w3schools.com/jsref/jsref_obj_regexp.asp) that allow you  to ignore case and repeat globally.  This is particularly useful bc many regexs in the wild are written with them. And bc they don't translate to a string - they cannot be supported or need to be rewritten. 

I'm proposing an easy way to allow regex strings to have the flags that we get in Javascript Regex Patterns. Is there interest in this from the community or from you @epoberezkin?
# Deeper Motivation / Example

I have a case where I'd like to require that the uri has the schema ("https://" in my case). To do this seems simple enough - just include the regex.  Of course [the regex for uri is pretty complex](https://github.com/epoberezkin/ajv/blob/master/lib/compile/formats.js#L9). Note that it leverages the 'ignorecase' (i.e. 'i') flag - so you'd need to go through the whole regex to try and make it case sensitive. Error prone, onerous and awesome to maintain.

What I would like to do is just take the 'uri' regex that you've already written and just add the required 'https://' bit to the front of it... keeping the flags intact since I'd obviously like this pattern to be case insensitive.

I wrote a package about a year ago that deals with this problem. It's called ['string-to-regexp'](https://www.npmjs.com/package/string-to-regexp) and allows you to write the regex in exactly the same form (though you do need to escape '\' characters).

In principal all you need to do is to replace occurances of `new RegExp(str)` with `strToRegExp(str)` -- assuming that you define `strToRegExp` with a require statement : `var strToRegExp = require('string-to-regexp');`

It looks to me like we'd only need to put this in 3 places to get the desired effect.

https://github.com/epoberezkin/ajv/blob/master/lib/ajv.js#L307
https://github.com/epoberezkin/ajv/blob/master/lib/compile/formats.js#L127
https://github.com/epoberezkin/ajv/blob/master/lib/compile/index.js#L200

The caveats related to the module are very reasonable. However allowing flags does extend beyond the strings that `new RegExp` takes - just as the Javascript regex format is slightly different - therefore there is a minute opportunity that this won't work as expected for some strings. BUT that opportunity is very small and we could solve this by allowing an option to turn it on or off in ajv.

Is there any interest in this? 
