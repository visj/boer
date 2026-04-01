# [778] QUESTION: is it possible to ignore the schema id warning?

Apologies if this has been covered, I couldn't find anything specifically covering this, but when using id vs $id is it possible to ignore / suppress the warning that states "schema id ignored XXXXXXX"

I am calling the schema from an Azure Cosmos DB, which has an "id" but is unrelated to the schema $id I want to validate. 

The issue is that each id / log warning goes into the Azure application insights, and frankly, is just cluttering the troubleshooting log; especially when the all errors config option is set.

Also additional apologies for not asking on https://gitter.im/ajv-validator/ajv according to the template but I can't understand why gitter requires access to basically my whole life and all my organizations data - recent Facebook hearings anyone?