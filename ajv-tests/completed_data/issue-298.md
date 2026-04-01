# [298] What is wrong with my schema ?

**Schema**

```
{
    type:'array', minItems:1,
    items:{
        type:'string',
        oneOf:[
          {enum:['admin']},
          {enum:['read','search']}
        ]
    }
}
```

**Data**
 `['admin','read']`

**Result**
`true`

**Expected Result**
 `false`
**Reason**
`admin` and `read` can not come together.
Valid inputs are 

```
['admin']
['read'] | ['search']
['read', 'search']
```
