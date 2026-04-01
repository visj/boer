# [1762] Error: unknown format "xxx" ignored in schema at path "#/definitions/xxx"

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

```
"ajv": "^8.6.3",
"ajv-draft-04": "^1.0.0",
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
http://json.schemastore.org/chrome-manifest

```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    "name": "awesome chrome extension boilerplate",
    "version": "1.0",
    "description": "made by awesome-chrome-extension-boilerplate",
    "manifest_version": 2,
    "minimum_chrome_version": "80",
    "permissions": [],
    "web_accessible_resources": ["icons/*", "images/*", "fonts/*"],
    "background": {
        "scripts": ["js/background.js"],
        "persistent": true
    },
    "content_scripts": [
        {
            "matches": ["https://github.com/*"],
            "css": ["css/all.css"],
            "js": ["js/vendor.js", "js/all.js"]
        }
    ],
    "browser_action": {
        "default_popup": "popup.html",
        "default_icon": {
            "16": "icons/extension-icon-x16.png",
            "32": "icons/extension-icon-x32.png",
            "48": "icons/extension-icon-x48.png",
            "128": "icons/extension-icon-x128.png"
        }
    },
    "options_ui": {
        "page": "options.html",
        "open_in_tab": true
    },
    "icons": {
        "16": "icons/extension-icon-x16.png",
        "32": "icons/extension-icon-x32.png",
        "48": "icons/extension-icon-x48.png",
        "128": "icons/extension-icon-x128.png"
    }
}
```

**Your code**

<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://ajv.js.org/guide/getting-started.html
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
const Ajv = require("ajv-draft-04")

const ajv = new Ajv();

const schema = require('./chrome-manifest.json');
const validate = ajv.compile(schema);

const data = require('./manifest.json');
const valid = validate(data);
if (!valid) console.log(validate.errors);

```

**Validation result, data AFTER validation, error messages**

```
Error: unknown format "match-pattern" ignored in schema at path "#/definitions/match_pattern"
```

**What results did you expect?**



**Are you going to resolve the issue?**
