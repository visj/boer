# [2346] format keyword in anyOf

I came across to this situation when for some reason the pattern and format or any other keyword is not working under allOff, anyOf.

I'm trying to achieve this scenario:

first part: In my data from 'name' information should be required either first_name and last_name OR full_name OR business_name
second part: Along with 'name' info I need to have one contact info as well it can be any of those: email1, email2, email3, home_phone, cell_phone, work_phone, full address 1, full address 2.

Plus to all above we should validate phone and email correspondingly per pattern and per format.

The tricky part is that if we have minimal requirement for intance we have full_name and email_1 and those are valid there is no need to check for other fields validity. Other example if we have first_name last_name and full_address 1, and we have invalid email_3 we should ignore email_3 validation as we have minimal set of what we needed ( first_name last_name and full_address 1).

Here is  my partial for that validation, but its not working. (properties are with dots - its ok, I'm not implying to nested)

```json
"allOf": [
        {
            "anyOf": [
                {"required": ['customers.first_name', 'customers.last_name']},
                {"required": ["customers.full_name"]},
                {"required": ["customers.business_name"]}
            ],
        },
        {
            "anyOf": [
                {
                    "properties": {
                        "customers.cell_phone": {
                            "type": ["null", "string"],
                            "pattern": "^(?:\\d{10}|\\d{3}-\\d{3}-\\d{4})$",
                            "minLength": 10,
                            "maxLength": 12,
                            "errorMessage": {
                                "pattern": "Cell phone does not match defined pattern."
                            }
                        },
                    },
                    "required": ["customers.cell_phone"],
                },
                {
                    "properties": {
                        "customers.work_phone": {
                            "type": ["null", "string"],
                            "pattern": "^(?:\\d{10}|\\d{3}-\\d{3}-\\d{4})$",
                            "minLength": 10,
                            "maxLength": 12,
                            "errorMessage": {
                                "pattern": "Work phone does not match defined pattern."
                            }
                        },
                    },
                    "required": ["customers.work_phone"]
                },
                {
                    "properties": {
                        "customers.home_phone": {
                            "type": ["null", "string"],
                            "pattern": "^(?:\\d{10}|\\d{3}-\\d{3}-\\d{4})$",
                            "minLength": 10,
                            "maxLength": 12,
                            "errorMessage": {
                                "pattern": "Home phone does not match defined pattern."
                            }
                        },
                    },
                    "required": ["customers.home_phone"]
                },
                {
                    "anyOf": [
                        {"required": ['customers.address_line_1', 'customers.zip', 'customers.city']},
                        {"required": ['customers.address_line_2', 'customers.zip', 'customers.city']}
                    ]
                },
                {
                    "anyOf": [
                        {
                            "properties": {
                                "customers.email_1": {
                                    "type": ["null", "string"],
                                    "format": "email"
                                }
                            },
                            "required": ["customers.email_1"],
                        },
                        {
                            "properties": {
                                "customers.email_2": {
                                    "type": ["null", "string"],
                                    "format": "email"
                                }
                            },
                            "required": ["customers.email_2"],
                        },
                        {
                            "properties": {
                                "customers.email_3": {
                                    "type": ["null", "string"],
                                    "format": "email"
                                }
                            },
                            "required": ["customers.email_3"],
                        }
                    ]
                }
            ],
        }
    ]
```

