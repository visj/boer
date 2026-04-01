# [806] Handling of draft-04 type of JSON objects with the Angular 4

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- browser/compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
5.5.2


**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
this.ajv = new Ajv(
        { allErrors: true,
          meta: false,
          extendRefs: true,
          unknownFormats: 'ignore',
          schemaId: 'id'}
    );


```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json

this.data = {
      'type': 'object',
      'label': 'object',
      'title': 'Object',
      'layout': 'section',
      'properties': {
        'array': {
          'type': 'array',
          'label': 'array',
          'title': 'Array',
          'layout': 'section'
        }
      }
    };
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json


```


**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/epoberezkin/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript

import { Component } from '@angular/core';
import * as Ajv from 'ajv';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  public ajv;
  public data: any;


  constructor() {
    this.ajv = new Ajv(
        { allErrors: true,
          meta: false,
          extendRefs: true,
          unknownFormats: 'ignore',
          schemaId: 'id'}
    );
  }

  ngOnInit() {
    this.ajv.addMetaSchema();  // how do i add here draft-4 json reference
    this.data = {
      'type': 'object',
      'label': 'object',
      'title': 'Object',
      'layout': 'section',
      'properties': {
        'array': {
          'type': 'array',
          'label': 'array',
          'title': 'Array',
          'layout': 'section'
        }
      }
    };
  }
      const val = this.ajv.validateSchema( JSON.parse(this.data));
}

```


**Validation result, data AFTER validation, error messages**

```
ERROR TypeError: Cannot read property '$id' of undefined
    at Ajv._getId (ajv.js:391)
    at Ajv.addSchema (ajv.js:131)
    at Ajv.addMetaSchema (ajv.js:151)
    at AppComponent.validateSchema (app.component.ts:54)
    at Object.eval [as handleEvent] (AppComponent.html:12)
    at handleEvent (core.js:13589)
    at callWithDebugContext (core.js:15098)
    at Object.debugHandleEvent [as handleEvent] (core.js:14685)
    at dispatchEvent (core.js:10004)

```

**What results did you expect?**
how do i import draft-04 json in angular 4 components 

**Are you going to resolve the issue?**
