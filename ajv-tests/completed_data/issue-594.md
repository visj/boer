# [594] predefined format date-time does not support leap seconds?

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

checked lib/compile/formats.js from master branch

It would appear that date-time regexp validator is not according to the specification. 
a--- checked lib/compile/formats.js ---
  // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
  'date-time': /^\d\d\d\d-[0-1]\d-[0-3]\d[t\s][0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?(?:z|[+-]\d\d:\d\d)$/i,
a---

However in https://tools.ietf.org/html/rfc3339#section-5.6 it is mentioned that
a---snip---
   time-hour       = 2DIGIT  ; 00-23
   time-minute     = 2DIGIT  ; 00-59
   time-second     = 2DIGIT  ; 00-58, 00-59, 00-60 based on leap second
                             ; rules
a---snip---

So should the regexp rule perhaps be altered from 
[0-2]\d:[0-5]\d:[0-5]\d 
to
[0-2]\d:[0-5]\d:[0-6]\d

