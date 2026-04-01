# [781] Checking validity of keywords

Currently ajv does not provide any option to check whatever the keywords you use are valid or not. Such option could be useful to reduce typos but more importantly ease the migration from other schema validation libraries and prevent using similar keywords used by other tools. (such as some orms where you might get used to use "max" instead of "maximum", or "allowedValues" instead of "enum")

It's a trivial task to check if a schema is valid or not, but since ajv already aware of valid keywords and can track custom ones I think having a such built-in feature would be nice.