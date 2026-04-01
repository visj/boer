# [864] Empty string, not required, but failing format checks.

Having a problem with the validation on AJV for an empty string.

I'm loading a psv file, and parsing to JSON, which parses null values as empty strings.  If this is the issue, then I can fix it upstream, but wanted to check behaviour.

**Latest version in use**

If I pass in an empty string for trading_end_date and trading_start_date, then the validation fails.

**Ajv options object**

```javascript    var ajv = new Ajv({ allErrors: true });
    var valid = ajv
        .addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'))
        .addSchema(schema, 'mySchema')
        .validate('mySchema', data);```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->
```json
"schema": {
        "type": "array",
        "items": {
            "title": "Location record",
            "type": "object",
            "properties": {
                "reporting_date": {
                    "description": "Reporting date",
                    "type": "string",
                    "format": "date"
                },
                "reporting_date_period_type": {
                    "type": "string",
                    "minLength": 1,
                    "maxLength": 1,
                    "enum": ["0", "1", "2", "3"]
                },
                "location_bkey": {
                    "type": "string",
                    "maxLength": 20,
                    "minLength": 1
                },
                "location_name": {
                    "type": "string",
                    "maxLength": 100,
                    "minLength": 1
                },
                "location_description": {
                    "type": "string",
                    "maxLength": 256
                },
                "location_subtype": {
                    "type": "string",
                    "maxLength": 30
                },
                "location_status": {
                    "type": "string",
                    "maxLength": 20
                },
                "city_town": {
                    "type": "string",
                    "maxLength": 100
                },
                "county_state": {
                    "type": "string",
                    "maxLength": 100
                },
                "country": {
                    "type": "string",
                    "maxLength": 100
                },
                "region": {
                    "type": "string",
                    "maxLength": 100
                },
                "subregion": {
                    "type": "string",
                    "maxLength": 100
                },
                "longitude_position": {
                    "type": "string",
                    "maxLength": 20
                },
                "latitude_position": {
                    "type": "string",
                    "maxLength": 20
                },
                "trading_start_date": {
                    "type": "string",
                    "format": "date"
                },
                "trading_end_date": {
                    "type": "string",
                    "format": "date"
                },
                "default_cluster": {
                    "type": "string",
                    "maxLength": 30
                },
                "building_floor_space": {
                    "type": "string",
                    "maxLength": 20
                },
                "stock_allocation_grade": {
                    "type": "string",
                    "maxLength": 10
                }
            },
            "required": [
                "reporting_date",
                "reporting_date_period_type",
                "location_bkey",
                "location_name"
            ],
            "primaryKey": [
                "location_bkey"
            ]
        }
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json

[ { reporting_date: '2018-05-27',
    reporting_date_period_type: '0',
    location_bkey: '1231231231,
    location_name: '1231231231',
    location_description: '',
    location_subtype: '',
    location_status: '',
    city_town: '',
    county_state: '',
    country: '',
    region: '',
    subregion: '',
    longitude_position: '',
    latitude_position: '',
    trading_start_date: '',
    trading_end_date: '',
    default_cluster: 'Default Cluster',
    building_floor_space: '',
    stock_allocation_grade: '' },
  { reporting_date: '2018-05-27',
    reporting_date_period_type: '0',
    location_bkey: '23424323',
    location_name: '23424323',
    location_description: '',
    location_subtype: '',
    location_status: '',
    city_town: '',
    county_state: '',
    country: '',
    region: '',
    subregion: '',
    longitude_position: '',
    latitude_position: '',
    trading_start_date: '',
    trading_end_date: '',
    default_cluster: 'Default Cluster',
    building_floor_space: '',
    stock_allocation_grade: '' } ]
```