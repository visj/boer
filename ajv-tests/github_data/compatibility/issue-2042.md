# [2042] Trouble importing Ajv using cdnjs.

I want to use Ajv on a webpage and I don't want to use a bundler. 
So I'm trying to import Ajv from cdnjs, but I get the following error:
```
Uncaught SyntaxError: The requested module 'https://cdnjs.cloudflare.com/ajax/libs/ajv/8.11.0/ajv7.min.js' does not provide an export named 'default' (at validation.js:1:8)
```
It feels like I'm missing something so any help on how to fix this would be appreciated.

**The version of Ajv you are using**
8.11.0
**The environment you have the problem with**
Chrome browser
**Your code (please make it as small as possible to reproduce the issue)**
validation.html:
```
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <script type="module" src="validation.js"></script>
    </head>
</html>
```
validation.js:
```
import Ajv from 'https://cdnjs.cloudflare.com/ajax/libs/ajv/8.11.0/ajv7.min.js';
```
**Results and error messages in your platform**
```
Uncaught SyntaxError: The requested module 'https://cdnjs.cloudflare.com/ajax/libs/ajv/8.11.0/ajv7.min.js' does not provide an export named 'default' (at validation.js:1:8)
```