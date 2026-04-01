# [279] Is AJV giving an incorrect result in these examples?

When I try to validate the first two data items (data2 and data3), AJV is telling me that they are valid.  The last one is the one that is invalid.  However I expected the first two cases to be invalid as well since they don't match the schema either (the schema says nothing about there being an array of properties).  Furthermore, the properties within the array don't even match the schema, they are invalid.  Why is ajv saying they are valid?

```
<script>
    //Note: to get AJV to work you need to load it before you load dojo, 
    //or else there will be confilct with require
    //
    //var Ajv = require('ajv');
    //require(["ajv/lib/ajv"], function (Ajv) {
        var ajv = Ajv({ allErrors: true });

        var schema2 = {
            "properties": {
                "prime": {
                    "type": "boolean"
                },
                "number": {
                    "type": "number",
                    "minimum": 1,
                    "maximum": 10
                },
                "name": {
                    "type": "string"
                }
            },
            "required": ["name"],
            "additionalProperties": false
        };


        var validate2 = ajv.compile(schema2);

        function test(data, validate) {
            var valid = validate(data);
            if (valid) console.log('AJV Valid!');
            else console.log('AJV Invalid: ' + ajv.errorsText(validate.errors));
        }



        var data2 = [
            { blah: 'one', number: 1, prime: false, mappedTo: 'E' },
            { name: 'two', number: 2, prime: true, mappedTo: 'D' },
            { name: 'three', number: 3, prime: true, mappedTo: 'C' },
            { name: 'four', number: 4, even: true, prime: false, mappedTo: null },
            { name: 'five', number: 5, prime: true, mappedTo: 'A' }
        ];

        var data3 = [{ blah: 'one', number: 1, prime: false, mappedTo: 'E' }];

        var data4 = { blah: 'one', number: 1, prime: false, mappedTo: 'E' };

        test(data2, validate2); //console output AJV Valid!
        test(data3, validate2); //console output AJV Valid!
        test(data4, validate2); //AJV Invalid: data should NOT have additional properties, data should NOT have additional properties, data should have required property 'name'

</script>
```
