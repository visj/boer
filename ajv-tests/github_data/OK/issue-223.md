# [223] Internal error when validating date-time in full mode

There is an internal error when validating a `date-time` format with the `'format': 'full'` option.

```
> validate({agent_ip: "", timestamp: "2016-01-02"}, schema)
TypeError: Cannot read property 'match' of undefined
    at o (/home/miaou/projects/events/couchapp-tos/couch/_design/url/validation/lib/ajv.js:2:6022)
    at Object.i [as validate] (/home/miaou/projects/events/couchapp-tos/couch/_design/url/validation/lib/ajv.js:2:6162)
    at validate (eval at localCompile (/home/miaou/projects/events/couchapp-tos/couch/_design/url/validation/lib/ajv.js:2:12680), <anonymous>:1:1259)
    at repl:1:1
    at REPLServer.defaultEval (repl.js:262:27)
    at bound (domain.js:287:14)
    at REPLServer.runBound [as eval] (domain.js:300:12)
    at REPLServer.<anonymous> (repl.js:431:12)
    at emitOne (events.js:82:20)
    at REPLServer.emit (events.js:169:7)
```
