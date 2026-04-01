# [522] Maximum call stack size exceeded when using 2 arrays with auto-ref

Using 5.1.5

```javascript
const validator= new Ajv({
    schemaId: "$id", 
    extendRefs: 'fail'
});
```
With the following schema added to `validator`:
```json
{
  "$id": "http://my.domain/schemas/node.json#",
  "title": "Node",
  "description": "base schema for all strategy graph nodes",
  "type": "object",
  "properties": {
    "id": {
      "not": {
        "type": "null"
      }
    },
    "incoming": {
      "$ref": "node.json#/definitions/listOfNodes"
    },
    "outgoing": {
      "$ref": "node.json#/definitions/listOfNodes"
    }
  },
  "required": [
    "id",
    "incoming",
    "outgoing"
  ],
  "definitions": {
    "listOfNodes": {
      "type": "array",
      "items": {
        "$ref": "node.json#"
      }
    }
  }
}
```

**Your code**
```javascript
var node1 = { 
  id: 'a',
  incoming: [],
  outgoing: [] 
}

var node2 =  { 
  id: 'b',
  incoming: [],
  outgoing: [] 
}

node1.outgoing.push(node2);
nod2.incoming.push(node1);

validator.validate('Node',node1);
```
Results in the `Maximum call stack` error.

I saw the example [here](https://code.tutsplus.com/tutorials/validating-data-with-json-schema-part-2--cms-25640) for mutually recursive schemas, so I thought this should work. Maybe it's the fact that it's the schema itself is recursive, rather than having another schema to bounce to and back from?