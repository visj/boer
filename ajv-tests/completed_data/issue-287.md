# [287] "name" property fails required check

```
{
  'properties': {
    'name': {
      'type': 'string',
    },
  },
  'required': ['name'],
}
```

No 'required property' error messages returned 

```
{
  'properties': {
    'notname': {
      'type': 'string',
    },
  },
  'required': ['notname'],
}
```

"required property" error message returned

Also, I wonder if you could squeeze some more speed out by checking for the existence of the property before the format? It seems like other required properties are returning "format of property should be XXX" instead of just "property doesn't exist"
