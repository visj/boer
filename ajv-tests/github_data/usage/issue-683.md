# [683] Fields dependency [question]

Hi, i have use case when value of one field should starts with value of another.
For example:
```json
{
  "field1": "/foo",
  "field2": "/foo/bar"
}
```
How can I achieve this behaviour? Or it's impossible? I guess that I should use `$data` keyword in something like `pattern` or `format`.
Many thanks.