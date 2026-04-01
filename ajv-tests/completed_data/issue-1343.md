# [1343] Wrong validation of hostname

Hello,
This change:
**d9661b4 Do hostname character count in regexp.**
causes that such hostname: "host: '1.2.3.'" (ending with a dot) is considered valid.
Schema: 
```
  "host": {
          "$id": "#/snmpConfig/properties/host",
          "type": "string",
          "format": "hostname",
          "description": "The IP address of the remote alarm receiver. Hostnames are also supported in this field.",
          "title": "Remote Server IP Address",
          "default": "localhost",
          "examples": ["localhost"]
        },
```
The problem is with this line:
```
diff --git a/lib/compile/formats.js b/lib/compile/formats.js
index f51a3b7..0e6e910 100644
--- a/lib/compile/formats.js
+++ b/lib/compile/formats.js
@@ -5,7 +5,7 @@ var util = require('./util');
 var DATE = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
 var DAYS = [0,31,28,31,30,31,30,31,31,30,31,30,31];
 var TIME = /^(\d\d):(\d\d):(\d\d)(\.\d+)?(z|[+-]\d\d(?::?\d\d)?)?$/i;
-var HOSTNAME = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{
0,61}[0-9a-z])?)*\.?$/i;
+var HOSTNAME = /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0
-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i;
```
After reverting to old HOSTNAME variable the validation works correct.