# [1232] Switch cache implementation to Map or WeakMap / Performance Best Practices

Hi, 

what I currently miss is a Performance Best Practice Page or Chapter in the Readme.MD. 

While I was benchmarking, I realized, that we are wasting cycles in serialization so when I dug deeper I realized that we stringify the Schema for getting a cache key. So instead I added to every schema a unique title attribute and set serialize to use the title attribute or still do the stringify on the object.

```
function getCacheKeyBySchema(schema: JSONSchema7): string {
	return schema.title || JSON.stringify(schema);
}
```

So we avoid a stringify on every validation. 

Are there any other performance improvements, that i am unaware of?