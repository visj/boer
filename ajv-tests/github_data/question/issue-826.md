# [826] minLength makes the property required

```javascript
{
  '$id': '/mySchema',
  'type': 'object',
  'properties': {
    name: {type: 'string'},
    uri: {type: 'string', minLength: 15}
  },
  'required': ['name']
}
```
`uri` is required. (Getting error: `should NOT be shorter than 15 characters`)

Is this an intended behavior?