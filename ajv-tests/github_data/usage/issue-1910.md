# [1910] Valid schema is marked as invalid

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.10.0

Example here:
https://jsfiddle.net/goleon/4yd7ez29/

**JTD Schema**
```json
{
  "definitions": {
    "Bar": {
      "properties": {
        "id": {
          "type": "string"
        }
      }
    }
  },
  "properties": {
    "sheets": {
      "elements": {
        "discriminator": "type",
        
        "mapping": {
          "PaperSheet": {
            "properties": {
              "charts": {
                "elements": {
                  "discriminator": "type",
                  
                  "mapping": {
                    "bar": {
                      "ref": "Bar"
                    },
                    "line": {
                      "properties": {
                        "id": {
                          "type": "string"
                        }
                      }
                    }
                  }
                  
                }
              }
            }
          }
        }
        
      }
    }
  }
}
```

**Validation result, data AFTER validation, error messages**
![image](https://user-images.githubusercontent.com/2270831/155091009-4d38491a-3002-422b-a94a-5bd4bac9f8bb.png)


but variant without extracting subschema is working:
```json
{
  "properties": {
    "sheets": {
      "elements": {
        "discriminator": "type",
        
        "mapping": {
          "PaperSheet": {
            "properties": {
              "charts": {
                "elements": {
                  "discriminator": "type",
                  
                  "mapping": {
                    "bar": {
                      "properties": {
                        "id": {
                          "type": "string"
                        }
                      }
                    },
                    "line": {
                      "properties": {
                        "id": {
                          "type": "string"
                        }
                      }
                    }
                  }
                  
                }
              }
            }
          }
        }
        
      }
    }
  }
}
```


