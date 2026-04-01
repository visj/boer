# [2551] JTD: Support RFC9557 timestamp with time zone (IXDTF, extends RFC3339)

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**

8.17.1 (JSON Type Definition)

**What problem do you want to solve?**

Validate IXDTF timestamps which include time zone, per RFC9557.

**What do you think is the correct solution to problem?**

[RFC9557](https://datatracker.ietf.org/doc/rfc9557/) extends [RFC3339](https://datatracker.ietf.org/doc/rfc3339/) with optional time zone information; it would be useful for `ajv` to be able to parse IXDTF timestamps which include a suffixed time zone.

**Will you be able to implement it?**

No

**Further information**

    npm install ajv
    npm install ajv-cli

    echo '{ "properties": { "ts": { "type": "timestamp" } } }'  > schema.json
    echo '{ "ts": "2025-07-01T12:34:00+01:00" }'                > ts1.json
    echo '{ "ts": "2025-07-01T12:34:00+01:00[Europe/London]" }' > ts2.json

    ajv --spec=jtd -s schema.json -d ts1.json -d ts2.json

... results in

    ts1.json valid
    ts2.json invalid
    [
      {
        instancePath: '/ts',
        schemaPath: '/properties/ts/type',
        keyword: 'type',
        params: { type: 'timestamp', nullable: false },
        message: 'must be timestamp'
      }
    ]