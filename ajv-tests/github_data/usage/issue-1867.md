# [1867] Parse objects on the query string

I will try to send an object via query string from the frontend, to the API and I set the ajv as validation layer by it doesn't convert the object 

example:
```js
http://localhost:300?bedrooms={min: 5, max: 6}
```

result 
`"bedrooms={min: 5, max: 6}"`

I expect 
```js
{
 bedrooms : {
   min: 5,
   max: 6,
}
}
```