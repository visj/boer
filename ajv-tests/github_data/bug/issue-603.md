# [603] Typings broken in 5.2.4

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
latest

```
interface KeywordDefinition {
    type?: string | Array<string>;
    async?: boolean;
    $data?: boolean;
    errors?: boolean | string;
    metaSchema?: Object;
    // schema: false makes validate not to expect schema (ValidateFunction)
    schema?: boolean;
    modifying?: boolean;
    valid?: boolean;
    // one and only one of the following properties should be present
    validate?: SchemaValidateFunction | ValidateFunction;
    compile?: (schema: any, parentSchema: Object) => ValidateFunction;
    macro?: (schema: any, parentSchema: Object) => Object | boolean;
    inline?: (it: Object, keyword: string, schema: any, parentSchema: Object) => string;
  }
```

simple 

```
ajv.addKeyword('range', { type: 'number', compile: function (sch, parentSchema) {
  var min = sch[0];
  var max = sch[1];

  return parentSchema.exclusiveRange === true
          ? function (data) { return data > min && data < max; }
          : function (data) { return data >= min && data <= max; }
} });
```
would emit
```
Type '(data: any) => boolean' is not assignable to type 'ValidateFunction'.
  Property 'schema' is missing in type '(data: any) => boolean'.
```
**What results did you expect?**
No errors
