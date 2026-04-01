# [1445] How to validate, if one property is "yes" then array should contain atleast one value.

Hi,
I want to validate, 
Case 1: When one property contain value "yes" then another property array should contain atleast one item.
Case 2: When one property contain value "no" then another property array should not contain any item.
Schema :
```
properties: {
  "emailTo": {
    "$id": "#root/ruleMetadata/notifications/success/emailTo",
    "title": "Emailto",
    "type": "array",
    "default": [],
    "items": {
      "$id": "#root/ruleMetadata/notifications/success/emailTo/items",
      "title": "Items",
      "type": "string",
      "default": "",
      "examples": [
        "amit.b"
      ]
    }
  },
  "attachException": {
    "$id": "#root/ruleMetadata/notifications/success/attachException",
    "title": "Attachexception",
    "type": "string",
    "enum": [
      "Yes",
      "No"
    ],
    "case_insensitive_enums": true,
    "default": "",
    "examples": [
      "no"
    ]
  }
}		
Case 1.                                                          
 "success": {
        "attachException": "Yes",
        "emailTo": ["abc.t"]
      }
Case 2.                                                          
 "success": {
        "attachException": "No",
        "emailTo": []
      }
```


Please tell me how to achieve this feature in my project.