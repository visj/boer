# [976] Schema recursion with hash $id not supported (schema compiles, validation throws)

AJV 6.10.0

**Ajv options object**

```javascript
const ajv = new Ajv({verbose: true, multipleOfPrecision: 12,  extendRefs: true});
```


**JSON Schema**

```json
const persistentMenu = {
    type: "object",
    properties: {
        locale: {
            type: "string"
        },
        composer_input_disabled: {
            type: "boolean"
        },
        call_to_actions: {
            type: "array",
            items: {
                oneOf: [{
                        $ref: "#definitions/postback"
                    },
                    {
                        $ref: "#definitions/web_url"
                    },
                    {
                        $ref: "#definitions/call_to_actions"
                    }
                ]
            }
        }
    },
    required: ["locale", "composer_input_disabled", "call_to_actions"],
    definitions: {
        definitions: {
            postback: {
                $id: "#definitions/postback",
                type: "object",
                properties: {
                    type: {
                        type: "string",
                        const: "postback"
                    },
                    title: {
                        type: "string"
                    },
                    payload: {
                        type: "string"
                    }
                },
                required: ["type", "title", "payload"]
            },
            call_to_actions: {
                $id: "#definitions/call_to_actions",
                type: "object",
                properties: {
                    type: {
                        type: "string",
                        const: "nested"
                    },
                    title: {
                        type: "string"
                    },
                    call_to_actions: {
                        type: "array",
                        items: {
                            oneOf: [{
                                    $ref: "#definitions/postback"
                                },
                                {
                                    $ref: "#definitions/web_url"
                                },
                                {
                                    $ref: "#definitions/call_to_actions"
                                }
                            ]
                        }
                    }
                },
                required: ["type", "title", "call_to_actions"]
            },
            web_url: {
                $id: "#definitions/web_url",
                type: "object",
                properties: {
                    type: {
                        type: "string",
                        const: "web_url"
                    },
                    title: {
                        type: "string"
                    },
                    url: {
                        type: "string"
                    }
                },
                required: ["type", "title", "url"]
            }
        }
    }
};

module.exports = {
    type: "object",
    required: ["persistent_menu"],
    properties: {
        persistent_menu: {
            type: "array",
            items: persistentMenu
        }
    }
};

```


**Sample data**

```json
{
	"persistent_menu": [
		{
			"locale": "default",
			"composer_input_disabled": false,
			"call_to_actions": [
				{
					"type": "postback",
					"title": "Nested Item One",
					"payload": "q",
					"url": "testo"
				},
				{
					"type": "web_url",
					"title": "Nested Item One",
					"payload": "d",
					"url": "testo"
				},
				{
					"type": "nested",
					"title": "Nested Item One",
					"payload": "a",
					"url": "testo",
					"call_to_actions": [
						{
							"type": "postback",
							"title": "Nested Item One",
							"payload": "a",
							"url": "testo"
						},
						{
							"type": "web_url",
							"title": "Nested Item One",
							"payload": "a",
							"url": "testo"
						},
						{
							"type": "postback",
							"title": "Nested Item One",
							"payload": "s"
						},
						{
							"type": "nested",
							"title": "Nested Item One",
							"payload": "s",
							"url": "testo",
							"call_to_actions": [
								{
									"type": "postback",
									"title": "Nested Item One",
									"payload": "s",
									"url": "testo"
								},
								{
									"type": "web_url",
									"title": "Nested Item One",
									"payload": "s",
									"url": "testo"
								},
								{
									"type": "postback",
									"title": "Nested Item One",
									"payload": "a"
								},
										{
											"type": "postback",
											"title": "Nested Item One",
											"payload": "a",
											"url": "testo"
										},
								{
									"type": "nested",
									"title": "Nested Item One",
									"payload": "j",
									"url": "testo",
									"call_to_actions": [
										{
											"type": "postback",
											"title": "Nested Item One",
											"payload": "a",
											"url": "testo"
										}
									]
								}
							]
						}
					]
				}
			]
		}
	]
}

```

```
ReferenceError: refVal3 is not defined
   at validate (eval at localCompile 
```

When self-reference is deeper than one generate this error, else work well.
