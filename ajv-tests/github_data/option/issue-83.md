# [83] Don't validate or use `id` for compile

Probably a breaking change, so maybe just an option for now. Basically from https://github.com/mulesoft-labs/osprey-mock-service/issues/12, buggy JSON schema IDs cause issues and users think the tool is broken. Maybe have an option to skip unique validation and never register into AJV when using `compile`?
