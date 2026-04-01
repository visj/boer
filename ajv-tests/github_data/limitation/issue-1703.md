# [1703] Unconstrained tuples doesn't fully consider `maxItems` when `additionalItems` is not `false`

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

Issue filing as a result of a [StackOverflow question](https://stackoverflow.com/questions/68419621/a-strict-mode-warning-of-electron-store/68437348).

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Looks like v8. Not sure.

**Ajv options object**
Unknown. Using `electron-store`

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "type": "array",
  "items": [
    true
  ],
  "minItems": 0,
  "maxItems": 999,
  "additionalItems": {
    "type": "object",
    "properties": {
      "id": {
        "type": "number"
      },
      "name": {
        "type": "string"
      }
    }
  }
}
```

**Sample data**

N/A

**Your code**

https://stackoverflow.com/questions/68419621/a-strict-mode-warning-of-electron-store/68437348
Copied for prosperity

```javascript
const Store = require('electron-store')

/** @type import('json-schema-typed').JSONSchema */
const schema = {
  todo: {
    type: 'array',
    items: [true],
    minItems: 0,
    maxItems: 999,
    additionalItems: {
      type: 'object',
      properties: {
        id: {
          type: 'number'
        },
        name: {
          type: 'string'
        }
      }
    }
  }
}

const todoStore = new Store({ schema })

const todoItem = [{ id: 1, name: '11111' }]

todoStore.set('todo', todoItem)

console.log(todoStore.get('todo'))

const newTodo = [...todoStore.get('todo')]
newTodo.push({ id: 2, name: '22222' })

todoStore.set('todo', prev)

console.log(todoStore.get('todo'))

module.exports = todoStore

```

**Validation result, data AFTER validation, error messages**
Does not reach validation.
Strict mode throws an error regarding unconstrained tuples.

**What results did you expect?**
I understand (and actually quite like in some ways) strict mode.

In this situation, I assume what's happening is if `additionalItems` is not `false`, the error is thrown. But given `maxItems` is set, I would expect this to be considedered not unconstrained tuples.

Maybe just a fail early oversight?

Sorry I'm not able to validate this with the latest version, nor look to see what version is being used by the electron store library. It must be 8 though because strict mode is kicking in.

**Are you going to resolve the issue?**
No 😅 busy making JSON Schema happen.