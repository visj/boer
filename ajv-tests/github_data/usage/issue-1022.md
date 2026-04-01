# [1022] can i validate schemas strict mode?

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv you are you using?**
6.10.0
**What problem do you want to solve?**
here is schemas:
```
{
    "openapi": "3.0.0",
    "info": {
        "version": "1.0.0",
        "title": "Swagger Petstore"
    },
    "paths": {
        "/supplierGoods/getVisionAuditOpLog.do": {
            "get": {
                "summary": "Add a new pet to the store",
                "parameters": [
                    {
                        "in": "query",
                        "name": "parameters",
                        "required": false,
                        "schema": {
                            "$ref": "#/components/schemas/parameters"
                        },
                        "style": "form",
                        "explode": true
                    }
                ],
                "responses": {
                    "200": {
                        "description": "ok"
                    }
                }
            }
        }
    },
    "components": {
        "schemas": {
            "parameters": {
                "type": "object",
                "properties": {
                    "currentPage": {
                        "type": "integer",
                        "description": "当前页数"
                    },
                    "recordPerPage": {
                        "type": "integer",
                        "description": "每页数量"
                    },
                    "tempGoodsId": {
                        "type": "integer",
                        "description": "临时商品id"
                    }
                },

                "required": [
                    "currentPage",
                    "recordPerPage",
                    "tempGoodsId",
                ]
            }
        }
    }
}
```
and my data:
```
data = {
        currentPage: 1,
        recordPerPage: 10,
        tempGoodsId: 1234,
        test: 1
      }
```
```
let valid = ajv.validate(schema, data);
```
when i run validate.it is success.
but it has an unnecessary property.I expect it be error.
in other word. only pass the validate when strict equal schema

**What do you think is the correct solution to problem?**
maybe a option
**Will you be able to implement it?**
