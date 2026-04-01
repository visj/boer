# [451] Keywords as variable name or property names are not compatible with QT Script Engine.

This library (ajv.js) is not compatible with QT Script Engine. A Javascript Engine for ECMAScript in C++/QT. 
Because this engine has problems when the variable names or property names are also javascript keywords. 

**Version of ajv** 4.11.5

**Example**
In *ajv.js* (4.11.5, not minified) at line 1291:
Or in *util.js* (master, source) at line 63:
```javascript
code = types.null ? '(': '(!' + data + ' || ';
```
"null" is a keyword in javascript. The javascript script parser detect this as syntax error.

**Solution:**
```javascript
code = types["null"] ? '(': '(!' + data + ' || ';
```

Names which also represent keywords cause problems.
If they are not wrapped in a string. 

**Incorrect**
```javascript
// Example
var obj = {};
obj.null = 0;
obj.if = 1;
obj.byte = 2;
obj.default = 3;
```
**Correct**
```javascript
// Workaround
var obj = {};
obj["null"] = 0;
obj["if"] = 1;
obj["byte"] = 2;
obj["default"] = 3;
```
Or just other names.

In a browser on Windows Chrome 56.0.2924.87 it has no problems with keywords as names. 
Background: Using this library in embedded systems with QT Script Engine.


