# [1142] How to not allow some properties for object

I have an object, I don't care about what properties it has, however, I don't want it to have specific properties (for example `foo` and `bar`)

So what is the keyword that makes the object not valid if it has one of these properties `['foo', 'bar']`

This is an example of a valid object
```
{
  'first_property': 1,
  'second_property': 'some_value',
  'another_property': 'xxx'
}
```

These are examples of an invalid object that I don't want
```
{
  'foo',
  'first_property': 1,
  'second_property': 'some_value',
  'another_property': 'xxx'
}
```
```
{
  'bar',
  'first_property': 1,
  'second_property': 'some_value',
  'another_property': 'xxx'
}
```
```
{
  'foo',
  'bar',
  'first_property': 1,
  'second_property': 'some_value',
  'another_property': 'xxx'
}
```