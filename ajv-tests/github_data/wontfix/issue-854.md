# [854] feature request, concatenate keywords

I want something like `join`, `prefix` and `bind` keywords in ajv so I could first validate the json and second concatenate based on these keywords, for example:


```
var schema =
{
  type: 'array',
  prefix: 'all ',
  join: ', ',
  items:
  {
    type: 'string',
    bind: (item, i) => item + ` = %${i}`,
  }

}

var data = ['item1', 'item2', 'item3'];

console.log(result)
//all item1 = %0, item2 = %1, item3 = %2
```
I scripted somehting like this today in node but the performance was very poor so far, it took 100ms to concatenate 100k  schema and data,  while ajv took roughly 10ms to validate the same schema and data for the same amount. 
I also wonder if it is possible to make my script as fast as ajv or the nature of the operation is culprit and so cpu-demanding?