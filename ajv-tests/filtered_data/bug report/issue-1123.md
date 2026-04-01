# [1123] Unexpected errors for anyOf schemas with additionalProperties: false


**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.10.2

**Ajv options object**

```javascript
const ajv = new Ajv({allErrors: true});
```

**JSON Schema**
```yaml
components:
  requestBodies:
    Contacts:
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Contacts'
      description: Set of contact data for a new contact.
      required: true
  schemas:
    AddressArrayType:
      type: object
      properties:
        addresses:
          type: array
          items:
            $ref: '#/components/schemas/AddressType'
          minItems: 1
          maxItems: 99
      additionalProperties: false
      required:
        - addresses
    AddressType:
      type: object
      properties:
        line1:
          type: string
          description: Address line 1
          example: '300 E Main St'
        line2:
          type: string
          description: Address line 2
          example: 'Apt. 14'
        city:
          type: string
          description: City, e.g. 'Madison'
        stateCode:
          type: string
          description: State code
          example: 'WI'
          pattern: '^([A-Z]{2})$'
        zip5:
          type: string
          description: 5-digit ZIP code
          example: '53780'
          pattern: '^([0-9]{5})$'
      additionalProperties: false
      required:
        - line1
        - city
        - stateCode
        - zip5
    ContactMechanisms:
      type: object
      anyOf:
        - $ref: '#/components/schemas/AddressArrayType'
        - $ref: '#/components/schemas/EmailArrayType'
        - $ref: '#/components/schemas/PhoneArrayType'
    EmailArrayType:
      type: object
      properties:
        emails:
          type: array
          items:
            $ref: '#/components/schemas/EmailType'
          minItems: 1
          maxItems: 99
      additionalProperties: false
      required:
        - emails
    EmailType:
      type: object
      properties:
        address:
          type: string
          description: Email address
          format: email
        type:
          type: string
          enum: ['HOME', 'WORK']
      additionalProperties: false
      required:
        - address
    Contacts:
      type: object
      properties:
        contactMechanisms:
          $ref: '#/components/schemas/ContactMechanisms'
        name:
          $ref: '#/components/schemas/Name'
      additionalProperties: false
      required:
        - contactMechanisms
        - name
    Name:
      type: object
      properties:
        first:
          type: string
          description: First name, e.g. 'John'
        last:
          type: string
          description: Last name, e.g. 'Smith'
        middle:
          type: string
          description: Middle name or initial
      additionalProperties: false
      required:
        - first
        - last
    ContactsResponse:
      type: object
      properties:
        contactId:
          description: 'The Contact ID'
          type: string
          format: uuid
      additionalProperties: false
    PhoneArrayType:
      type: object
      properties:
        phones:
          type: array
          items:
            $ref: '#/components/schemas/PhoneType'
          minItems: 1
          maxItems: 99
      additionalProperties: false
      required:
        - phones
    PhoneType:
      type: object
      properties:
        number:
          type: string
          description: Phone number
        phoneType:
          type: string
          enum: ['HOME', 'WORK', 'CELL']
      additionalProperties: false
      required:
        - number
```

**Sample data**

```json
{
	"contactMechanisms": {
		"addresses": [
			{
				"line1": "300 E Main St",
				"city": "Madison",
				"stateCode": "WI",
				"zip5": "53780"
			}
		],
		"emails": [
			{
				"address": "fake@mydomain.com"
			}
		]
	},
	"name": {"first": "Henry", "last": "Smith", "middle": "J" },
}
```

**Your code**
```javascript
// Create validator, add and compile schemas.
    const ajv = new Ajv({allErrors: true});
    const modelNames = Object.getOwnPropertyNames(models);
    modelNames.forEach(modelName => {
      const modelKey = `#/components/schemas/${modelName}`;
      ajv.addSchema(models[modelName], modelKey);
    });
    const validate = ajv.compile(contactsModel);

    // Validate...
    const valid = validate(contactObject);
    if (!valid) {
      const message = `Validation of contact object failed.  Errors: ${validate.errors}`;
      const error = new Error(message);
      error.errors = validate.errors;

      throw error;
    }
```

Full code is here:
https://github.com/thetumper/contact-schema-validator

**Validation result, data AFTER validation, error messages**

```
errors: 
       [ { keyword: 'additionalProperties',
           dataPath: '.contactMechanisms',
           schemaPath: '#/additionalProperties',
           params: { additionalProperty: 'emails' },
           message: 'should NOT have additional properties' },
         { keyword: 'additionalProperties',
           dataPath: '.contactMechanisms',
           schemaPath: '#/additionalProperties',
           params: { additionalProperty: 'addresses' },
           message: 'should NOT have additional properties' },
         { keyword: 'additionalProperties',
           dataPath: '.contactMechanisms',
           schemaPath: '#/additionalProperties',
           params: { additionalProperty: 'addresses' },
           message: 'should NOT have additional properties' },
         { keyword: 'additionalProperties',
           dataPath: '.contactMechanisms',
           schemaPath: '#/additionalProperties',
           params: { additionalProperty: 'emails' },
           message: 'should NOT have additional properties' },
         { keyword: 'required',
           dataPath: '.contactMechanisms',
           schemaPath: '#/required',
           params: { missingProperty: 'phones' },
           message: 'should have required property \'phones\'' },
         { keyword: 'anyOf',
           dataPath: '.contactMechanisms',
           schemaPath: '#/anyOf',
           params: {},
           message: 'should match some schema in anyOf' },
         [length]: 6 ] }

```

**What results did you expect?**
Expected no errors.

**Are you going to resolve the issue?**
Happy to help, if given some pointers.  My personal repo has a project for reproducing the issue:

https://github.com/thetumper/contact-schema-validator
