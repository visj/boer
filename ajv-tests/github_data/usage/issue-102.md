# [102] Validation throws errors against valid schema and document with type array

JSON schema:

```
{
"multiBrandConfig": {
                        "type": "object",
                        "@template_id": "PCE-1bc6b0e7-02bb-47d9-a794-eb22da40be25",
                        "javaInterfaces": [
                          "java.io.Serializable"
                        ],
                        "properties": {
                          "preferredBrandOrder": {
                            "type": "array",
                            "enum": [
                              "VISA",
                              "MASTER_CARD",
                              "AMEX",
                              "DISCOVER",
                              "CHINA_UNION_PAY",
                              "CB_NATIONALE",
                              "CETELEM"
                            ]
                          }
                        }
                      }
                    }
```

JSON Document

```
"multiBrandConfig": {
                                "preferredBrandOrder": [
                                    "VISA",
                                    "CHINA_UNION_PAY"
                                ]
                            }
```

Error

```
should be equal to one of values
Schema: (VISA,MASTER_CARD,AMEX,DISCOVER,CHINA_UNION_PAY,CB_NATIONALE,CETELEM)
Data: VISADISCOVER
```
