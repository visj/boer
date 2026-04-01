# [2237] The instancePath property is empty. 

Missing instance path "". ?? when throws "required". Maybe we should have path:"/name" 
```
{ 
instancePath: '', 
schemaPath: '#/required', 
keyword: 'required', 
params: { missingProperty: 'name' }, 
message: "must have required property 'name'" 
}
```
How I can get nested required if the first level required is shadowing the real property that I want to validate? Example: 

```
{
  root: {
       value: {},
       "required": ["value"]
  }
}
```

and get : /root/value  for body {}