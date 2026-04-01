# [590] $merge of a schema with a nested $ref works fine. error was due to typo.

Validation of this sample request fails with a false positive on missing `geo_location`

```
{
	"identifier": "noone@nowhere.com",
	"identifier_type": "email",
	"locale": "en_US",
	
	"user": {
		"first_name": "John",
		"last_name": "Smith",
		"password": "secret",
		
		"gender": "male",
		"birthday": "1980-12-13",

		"geo_location:": {
			"latitude": 41.4995,
			"longitude": -81.6954
		},

		"locale": "en_US"
	}
}
```

The difference with `geo_location` is that it's a $ref to an object, where `locale` for that matter is a $ref to a type.

Here are the relevant schemas which is easy to replicate with.
`#api/register` at the bottom is the one I use to perform the validation.

```
{
  "$id": "#types/point",
  "$async": true,
  "type": "object",
  "properties": {
    "latitude": {
      "type": "number"
    },
    "longitude": {
      "type": "number"
    }
  },
  "required": [
    "latitude",
    "longitude"
  ]
}
```

```
{
  "$id": "#models/user",
  "$async": true,
  "type": "object",
  "properties": {
    "password": {
      "type": "string"
    },

    "first_name": {
      "type": "string"
    },
    "middle_name": {
      "type": "string"
    },
    "last_name": {
      "type": "string"
    },

    "gender": {
      "type": "string",
      "enum": [
        "male",
        "female"
      ]
    },
    "birthday": {
      "type": "string",
      "format": "date"
    },

    "locale": {
      "$ref": "#types/locales"
    },

    "geo_location": {
      "$ref": "#types/point"
    }
  }
}
```

```
{
  "$id": "#types/locale",
  "$async": true,
  "type": "object",
  "properties": {
    "locale": {
      "$ref": "#types/locales"
    }
  },
  "required": [
    "locale"
  ]
}
```

```
{
  "$id": "#types/locales",
  "$async": true,
  "type": "string",
  "enum": [
    "en_US"
  ]
}
```

```
{
  "$id": "#models/user_register",
  "$async": true,
  "$merge": {
    "source": {
      "$ref": "#models/user"
    },
    "with": {
      "required": [
        "password",

        "first_name",
        "last_name",

        "gender",
        "birthday",
      
        "locale",
        "geo_location"
      ]
    }
  }
}
```

```
{
  "$id": "#types/identifier_type",
  "$async": true,
  "type": "string",
  "enum": [
    "phone",
    "email"
  ]
}
```

```
{
  "$id": "#api/register",
  "$async": true,
  "type": "object",
  "properties": {
    "identifier": {
      "type": "string"
    },
    "identifier_type": {
      "$ref": "#types/identifier_type"
    },

    "user": {
      "$ref": "#models/user_register"
    },

    "locale": {
      "$ref": "#types/locales"
    }
  },
  "if": {
    "properties": {
      "identifier_type": {
        "const": "email"
      }
    }
  },
  "then": {
    "required": [
      "identifier",
      "identifier_type",
      "locale",
      "user"
    ]
  },
  "else": {
    "required": [
      "identifier",
      "identifier_type",
      "locale"
    ]
  }
}
```