# [887] ajv-errors 1.0.0 incompatible with ajv 6.5.5 cause chrome crash!

schema：
{"title":"","type":"object","properties":{"file_url":{"type":"object","properties":{}},"delay_type":{"type":"object","properties":{"name":{"type":"string"},"key":{"type":"string"}},"required":[],"keys":["delay_type"]},"hold_zwh_time":{"type":"string"},"join_book_url":{"type":"object","properties":{}},"reward_type":{"type":"object","properties":{"name":{"type":"string"},"key":{"type":"string"}},"required":[],"keys":["reward_type"]},"join_oath_date_url":{"type":"object","properties":{}},"join_oath_date":{"type":"string"},"committee_file_url":{"type":"string"},"superior_party_committee_date":{"type":"string"},"other_time":{"type":"string"}},"required":["hold_zwh_time","superior_party_committee_date","join_oath_date","reward_type","delay_type","other_time"],"$id":"ccp_develop_positive_delay","errorMessage":{"type":"object","required":{"other_time":"error tip"}}}

model：
{"file_url":{},"join_book_url":{},"join_oath_date_url":{},"reward_type":{"name":"yc","key":"14"},"delay_type":{"name":"other","key":"2","parent":"-1"}}

const ajv = new ajvErrors(Ajv({ allErrors: true, jsonPointers: true, useDefaults: true }));
const validator = ajv.compile(schema);
const valid = validator(model);
if (!valid) {
......
}

when execute script like this chrome 70 will block and crash!