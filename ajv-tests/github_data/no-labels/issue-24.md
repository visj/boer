# [24] Easily resolve type at JSONPath

Given a JSONPath (or similar structure) and a schema, is there a good way to determine the type ('string', 'object', etc) for a value at that path?

JSONPath `store.book[0].title` might resolve to 'string' against a schema for a book store record.

Would the best approach be to just navigate the schema structure directly?
