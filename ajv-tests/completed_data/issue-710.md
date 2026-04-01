# [710] Email Address never matches with the pattern

I am writing a code with NodeJS 8.1.4 and I use AJV for JSON schema validations. I want my users be able to register with emailAddress or phoneNumber. So I defined schema like below:

register: {
        "id": "/Register",
        "type": "object",
        "properties": {
            "phoneNumber": {
                "type": "string",
                "pattern": "^(09)([0-9]{9})$"
            },
            "emailAddress": {
                "type": "string",
                "pattern": "^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,10}$"
            },
            "password": {
                "type": "string",
                "minLength": 6,
                "maxLength": 64
            },
            "firstName": {
                "type": "string",
                "minLength": 2,
                "maxLength": 64
            },
            "lastName": {
                "type": "string",
                "minLength": 2,
                "maxLength": 64
            }
        },
        "oneOf": [{
            "required": ["emailAddress", "password", "firstName", "lastName"]
        }, {
            "required": ["phoneNumber", "password", "firstName", "lastName"]
        }]
    },

When there is phoneNumber it works clockwise. But when there is emailAddress, always should match pattern error appears. I checked the same pattern and email address separately times and it was true. I think it must be another problem. Thanks.