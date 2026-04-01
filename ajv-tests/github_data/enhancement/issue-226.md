# [226] Issue with line feed chars in json

I want to validate a json file with keys that contain `\n` chars. This is a valid JSON string produced by JSON.stringify. Unfortunately ajv cannot compile these keys and is producing the following javascript code which causes schema compilation to fail with `Uncaught SyntaxError: Unexpected token ILLEGAL`

``` js
var valid1 = errors === errs_1; }  if (data['
    <users>
    ${0}
    </users>
'] !== undefined) {   var errs_1 = errors; if (typeof data['
    <users>
    ${0}
    </users>
'] !== "string") {    var err =  { keyword: 'type' , dataPath: (dataPath || '') + '[\'
    <users>
    ${0}
    </users>
\']' 
```

**json:**

``` json
"\n        <user name=\"${0}\">${1}</user>\n    ": {
  "type": "string"
},
"\n    <users>\n    ${0}\n    </users>\n": {
  "type": "string"
}
```
