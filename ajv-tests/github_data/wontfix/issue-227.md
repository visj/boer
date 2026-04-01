# [227] The message for additionalProperties isn't as helpful as others

For most errors, `dataPath` and `message` combine to form something that makes it easy to see what's wrong (which makes `errorsText` useful, since it concats those fields).

However, if you get an `additionalProperties` error, the property causing problems isn't included in the message.

In particular, could we change this:

``` js
{ keyword: 'additionalProperties',
  dataPath: '',
  schemaPath: '#/additionalProperties',
  params: { additionalProperty: 'extra_field' },
  message: 'should NOT have additional properties' }
```

to one of these instead?

``` js
{ keyword: 'additionalProperties',
  dataPath: '',
  schemaPath: '#/additionalProperties',
  params: { additionalProperty: 'extra_field' },
  message: 'should NOT have additional properties (extra_field)' }

{ keyword: 'additionalProperties',
  dataPath: '',
  schemaPath: '#/additionalProperties',
  params: { additionalProperty: 'extra_field' },
  message: 'should NOT have extra_field' }
```

I think the second option is particularly appealing, since it's very similar to other error messages, like `type`:

``` js
{ keyword: 'type',
  dataPath: '.bad_field',
  schemaPath: '#/bad_field',
  params: { type: 'number' },
  message: 'should be number' }
```

I can work on a PR if this is something that should be fixed.

(side-note: could we also make "NOT" lowercase in the message?)
