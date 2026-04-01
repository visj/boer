# [1709] $recursiveRef: only supports hash fragment reference

AJV: 8.6.2
Draft: 2019-09

Hi, I've run into into a issue with `$recursiveAnchor` and `$recursiveRef` where I'm unable to target non-root schemas using `$recursiveRef`. For simplicity, below is the TypeScript data structure I'm trying to represent in JSON schema.

```typescript
interface Element {
    elementId: string
    elements:  Element[]
}

interface Node {
    nodeId:   string
    nodes:    Node[]
    element:  Element
}
```
The following is the JSON schema I'm using to represent the above type. I believe JSON schema interprets the `#` pointer in the following to refer to the root schema in nested schemas, causing the inner `Element` array to be interpreted as an array of type `Node`. This is expected behaviour.
```
{
  "additionalProperties": false,
  "$id": "Node",                       // <------------+
  "$recursiveAnchor": true,            //              |
  "type": "object",                    //              |
  "properties": {                      //              |
    "nodeId": {                        //              |
      "type": "string"                 //              |
    },                                 //              |
    "nodes": {                         //              |
      "type": "array",                 //              | { $recursiveRef: '#' } targets root schema "Node"
      "items": {                       //              | 
        "$recursiveRef": "#"           // -------------+ 
      }                                //              | 
    },                                 //              |
    "element": {                       //              |
      "additionalProperties": false,   //              |
      "$id": "Element",                //              |
      "$recursiveAnchor": true,        //              |
      "type": "object",                //              |
      "properties": {                  //              |
        "elementId": {                 //              |
          "type": "string"             //              |
        },                             //              |
        "elements": {                  //              |
          "type": "array",             //              |
          "items": {                   //              |
            "$recursiveRef": "#"       // -------------+
          }
        }
      }
    }
  }
}
```
To address this, I've tried passing an explicit JSON pointer to try and target the appropriate sub schema.
```
{
  "additionalProperties": false,
  "$id": "Node",                        // <------------+
  "$recursiveAnchor": true,             //              |
  "type": "object",                     //              | Array of Node
  "properties": {                       //              |
    "nodeId": {                         //              |
      "type": "string"                  //              |
    },                                  //              |
    "nodes": {                          //              |
      "type": "array",                  //              |
      "items": {                        //              |
        "$recursiveRef": "Node#"        // -------------+  
      }                              
    },                               
    "element": {                     
      "additionalProperties": false, 
      "$id": "Element",                 // <------------+
      "$recursiveAnchor": true,         //              |
      "type": "object",                 //              |  Array of Element
      "properties": {                   //              |
        "elementId": {                  //              |
          "type": "string"              //              |
        },                              //              |
        "elements": {                   //              |
          "type": "array",              //              |
          "items": {                    //              |
            "$recursiveRef": "Element#" // -------------+
          }
        }
      }
    }
  }
}
```
However, AJV is reporting the following for the second schema.
```
Error: "$recursiveRef" only supports hash fragment reference
```
Not sure if this is against specification, or a possible constraint with some of the architectural changes in AJV to support these newer drafts. I've come across https://github.com/ajv-validator/ajv/issues/1198 which suggests dynamic ref scoping (which I'm guessing relates to this) So not sure if this is working as intended or is a bug. However, I've tested the second schema in [JSON.NET Schema](https://www.jsonschemavalidator.net/) which seems to support referencing of this kind. So not sure. 

**What do you think is the correct solution to problem?**

Allow `$recursiveRef` to support `$id` referencing.


