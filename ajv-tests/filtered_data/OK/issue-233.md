# [233] Email format used with Switch..if..else of V5 causes error

I am using the following schema:

`{
  "definitions": {
    "age": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": [
            "AGE"
          ]
        },
        "operator": {
          "type": "string",
          "enum": [
            "EQUAL_TO",
            "GREATER_THAN_EQUAL_TO",
            "LESS_THAN_EQUAL_TO"
          ]
        },
        "expected": {
          "type": "integer",
          "minimum": 16
        }
      },
      "required": [
        "type",
        "operator",
        "expected"
      ]
    },
    "birth_month": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": [
            "BIRTH_MONTH"
          ]
        },
        "operator": {
          "type": "string",
          "enum": [
            "EQUAL_TO",
            "GREATER_THAN_EQUAL_TO",
            "LESS_THAN_EQUAL_TO"
          ]
        },
        "expected": {
          "type": "number",
          "minimum": 1,
          "maximum": 12
        }
      },
      "required": [
        "type",
        "operator",
        "expected"
      ]
    },
    "customers": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": [
            "CUSTOMERS"
          ]
        },
        "operator": {
          "type": "string",
          "enum": [
            "IN"
          ]
        },
        "expected": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "email": {
                "type": "string",
                "format": "email"
              }
            }
          }
        }
      },
      "required": [
        "type",
        "operator",
        "expected"
      ]
    },
    "date": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": [
            "DATE"
          ]
        },
        "operator": {
          "type": "string",
          "enum": [
            "EQUAL_TO",
            "GREATER_THAN_EQUAL_TO",
            "LESS_THAN_EQUAL_TO"
          ]
        },
        "expected": {
          "type": "string",
          "format": "date-time"
        }
      },
      "required": [
        "type",
        "operator",
        "expected"
      ]
    },
    "gender": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": [
            "GENDER"
          ]
        },
        "operator": {
          "type": "string",
          "enum": [
            "EQUAL_TO"
          ]
        },
        "expected": {
          "type": "string",
          "enum": [
            "MALE",
            "FEMALE"
          ]
        }
      },
      "required": [
        "type",
        "operator",
        "expected"
      ]
    },
    "join_date": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": [
            "JOIN_DATE"
          ]
        },
        "operator": {
          "type": "string",
          "enum": [
            "EQUAL_TO",
            "GREATER_THAN_EQUAL_TO",
            "LESS_THAN_EQUAL_TO"
          ]
        },
        "expected": {
          "type": "string",
          "format": "date-time"
        }
      },
      "required": [
        "type",
        "operator",
        "expected"
      ]
    },
    "purchase": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": [
            "PURCHASE"
          ]
        },
        "operator": {
          "type": "string",
          "enum": [
            "EQUAL_TO",
            "GREATER_THAN_EQUAL_TO",
            "LESS_THAN_EQUAL_TO"
          ]
        },
        "expected": {
          "type": "number",
          "minimum": 0
        },
        "date": {
          "type": "string",
          "format": "date-time"
        }
      },
      "required": [
        "type",
        "operator",
        "expected",
        "date"
      ]
    },
    "redemptions": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": [
            "REDEMPTIONS"
          ]
        },
        "operator": {
          "type": "string",
          "enum": [
            "EQUAL_TO"
          ]
        },
        "expected": {
          "type": "number",
          "minimum": 0
        },
        "perUser": {
          "type": "string",
          "enum": [
            "true",
            "false"
          ]
        }
      },
      "required": [
        "type",
        "operator",
        "expected",
        "perUser"
      ]
    },
    "visits": {
      "type": "object",
      "properties": {
        "type": {
          "type": "string",
          "enum": [
            "VISITS"
          ]
        },
        "operator": {
          "type": "string",
          "enum": [
            "EQUAL_TO",
            "GREATER_THAN_EQUAL_TO",
            "LESS_THAN_EQUAL_TO"
          ]
        },
        "expected": {
          "type": "number",
          "minimum": 0
        },
        "date": {
          "type": "string",
          "format": "date-time"
        }
      }
    }
  },
  "type": "array",
  "items": {
    "type": "object",
    "switch": [
      {
        "if": {
          "properties": {
            "type": {
              "type": "string",
              "enum": [
                "AGE"
              ]
            }
          }
        },
        "then": {
          "$ref": "#\/definitions\/age"
        }
      },
      {
        "if": {
          "properties": {
            "type": {
              "type": "string",
              "enum": [
                "BIRTH_MONTH"
              ]
            }
          }
        },
        "then": {
          "$ref": "#\/definitions\/birth_month"
        }
      },
      {
        "if": {
          "properties": {
            "type": {
              "type": "string",
              "enum": [
                "CUSTOMERS"
              ]
            }
          }
        },
        "then": {
          "$ref": "#\/definitions\/customers"
        }
      },
      {
        "if": {
          "properties": {
            "type": {
              "type": "string",
              "enum": [
                "AGE"
              ]
            }
          }
        },
        "then": {
          "$ref": "#\/definitions\/age"
        }
      },
      {
        "if": {
          "properties": {
            "type": {
              "type": "string",
              "enum": [
                "DATE"
              ]
            }
          }
        },
        "then": {
          "$ref": "#\/definitions\/date"
        }
      },
      {
        "if": {
          "properties": {
            "type": {
              "type": "string",
              "enum": [
                "GENDER"
              ]
            }
          }
        },
        "then": {
          "$ref": "#\/definitions\/gender"
        }
      },
      {
        "if": {
          "properties": {
            "type": {
              "type": "string",
              "enum": [
                "JOIN_DATE"
              ]
            }
          }
        },
        "then": {
          "$ref": "#\/definitions\/join_date"
        }
      },
      {
        "if": {
          "properties": {
            "type": {
              "type": "string",
              "enum": [
                "PURCHASE"
              ]
            }
          }
        },
        "then": {
          "$ref": "#\/definitions\/purchase"
        }
      },
      {
        "if": {
          "properties": {
            "type": {
              "type": "string",
              "enum": [
                "REDEMPTIONS"
              ]
            }
          }
        },
        "then": {
          "$ref": "#\/definitions\/redemptions"
        }
      },
      {
        "if": {
          "properties": {
            "type": {
              "type": "string",
              "enum": [
                "VISITS"
              ]
            }
          }
        },
        "then": {
          "$ref": "#\/definitions\/visits"
        }
      }
    ]
  }
}`
The customers field has a list of emails. When I enter invalid string instead of valid email, it throws the following error:
`angular.js:13642 TypeError: ajvErrors.forEach is not a function
    at AjvErrorResolver.resolve (http://localhost:9090/resources/app.js:63499:15)
    at http://localhost:9090/resources/app.js:63537:22
    at Array.forEach (native)
    at AjvErrorResolver.resolve (http://localhost:9090/resources/app.js:63499:15)
    at ConstraintValidator.isValid (http://localhost:9090/resources/app.js:103839:76)
    at RewardEditConstraintController.updateReward (http://localhost:9090/resources/app.js:102993:45)
    at Object.updateReward (http://localhost:9090/resources/app.js:102984:20)
    at RewardEditController.next (http://localhost:9090/resources/app.js:63630:40)
    at fn (eval at compile (http://localhost:9090/resources/app.js:24296:16), <anonymous>:4:278)
    at expensiveCheckFn (http://localhost:9090/resources/app.js:25385:19)` 

Is there something wrong with my schema or is it a bug in AJV? As the title says, I enable V5. This is my first post here so apologies if I failed to follow any conventions while posting this question.
