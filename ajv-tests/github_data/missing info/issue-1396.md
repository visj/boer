# [1396] Throw runtime error

ajv version: 7.0.3

Here is the error message:

```
Error compiling schema, function code: const schema2 = scope.schema[2];const schema1 = scope.schema[1];return function validate1(data, {dataPath="", parentData, parentDataProperty, rootData=data}={}){let vErrors = null;let errors = 0;if(!(((typeof data == "number") && (!(data % 1) && !isNaN(data))) && (isFinite(data)))){validate1.errors = [{keyword:"type",dataPath,schemaPath:"#/definitions/nonNegativeInteger/type",params:{type: "integer"},message:"should be integer"}];return false;}if((typeof data == "number") && (isFinite(data))){if(data < 0 || isNaN(data)){validate1.errors = [{keyword:"minimum",dataPath,schemaPath:"#/definitions/nonNegativeInteger/minimum",params:{comparison: ">=", limit: 0},message:"should be >= 0"}];return false;}}validate1.errors = vErrors;return errors === 0;}
```

My code([Refer to official documents](https://github.com/ajv-validator/ajv#getting-started)):

```typescript
import Ajv, {JSONSchemaType, DefinedError} from "ajv"

const ajv = new Ajv()

type MyData = {foo: number}

const schema: JSONSchemaType<MyData> = {
  type: "object",
  properties: {
    foo: {type: "number", minimum: 0},
  },
  required: ["foo"],
  additionalProperties: false,
}

const validate = ajv.compile(schema)
```

What suggestions do you have for this? 
Thank you