# [158] Allow coerce to array of {integer,number,string,boolean,null}

I have a use case when I'm validating query parameters. I have `/api?filter=A` => `{ filter:'A' }` and `/api?filter=A&filter=B` =>  `{ filter:['A','B'] }` being passed in. Currently I'm iterating through the object and schema to find this case and coerce before validation, but it would be faster and cleaner to have it built-in.

Can we extend the coerce to allow casting to an array when it's items type is non-array/object?

**example**
partial schema:

``` javascript
{ "type":"object", "properties":{
"filter":{
   "type":"array",
  "items":{ "type":"integer" } // possible types: integer,number,string,boolean,null
}
}}
```

input

``` json
{
  "filter":"42"
}
```

expected output:

``` json
{
  "filter":[42]
}
```
