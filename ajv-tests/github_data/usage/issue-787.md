# [787] Method for schema to include one attribute of a list of attributes?

Using version 6.5

My issue is I have a request object that must contain one attribute and should contain one and only one other attribute from a list of attributes OR None of those specified attributes. I have done some digging around and have been unable to find a solution for this issue.

Possible valid requests:
{ 'query': {...}, 'limit': 1 }
{ 'query': {...}, 'count': true }
{ 'query': {...}, 'max': 'my_string' }

An invalid request would be:
{ 'query': {...}, 'limit': 1, 'count': true }
or 
{ 'query': {...}, 'max': 'my_string', limit: 1 }
etc.

The best ajv validator object I have come up with is the following:
```
{
	"type": "object",
	"required": ["query"],
	"maxProperties": 2,
	"properties": {
		"query": {
			"type": "object"
		},
		"limit": {
			"type": "integer"
		},
		"count": {
			"type": "boolean"
		},
                "max": {
                        "type": "string"
                }
	}
}
```

But I know this won't scale as our application grows. I was wondering if there was a way to specify that the object requires "query" and ONE or NONE of "limit", "count", "max.