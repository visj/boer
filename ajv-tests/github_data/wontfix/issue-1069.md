# [1069] XMLSchema's IDREF 

Hi,

I'm not sure if this is supported or not with existing operators. But I would like to have something similar to `idref` in XML. The nearest I can find is `$data`. But I don't know how to specify that a reference id must be included in an array of object.

```js
{
  images: [
    { id: 'a', url: 'http://localhost/images/a' },
    { id: 'b', url: 'http://localhost/images/b' },
    { id: 'c', url: 'http://localhost/images/c' }
    // ...
  ],
  users: [
    { id: 'a', imageId: 'a' } // How can I verify `imageId` is included in `#/images`
    { id: 'b', imageId: 'f' } // Here I want it to error: f is not defined `#/images`
    // ...
  ]
}
```