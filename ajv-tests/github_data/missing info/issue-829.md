# [829] Customize JsonSchemaValidation Error Messages

Below is my code but getting validation message like Invalid type. Expected String but got Integer. Line 2, position 20. but i need user friendly message like ( name should be string )

string schemaJson = @"{
            'description': 'A person',
            'type': 'object',
            'properties': {
            'name': {'type': 'string'}
            }
            }
            }";

            JsonSchema schema = JsonSchema.Parse(schemaJson);

            JObject person = JObject.Parse(@"{
    'name': 12323123
        }");

            IList<string> messages;
            bool valid = person.IsValid(schema, out messages);