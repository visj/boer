# [664] Custom async keyword error return [usage help]

I have implemented a custom async keyword `isChildTermOf` that calls an API to check if a given ontology term is a child of another term. I'm having issues returning the errors when validation fails.
The CUSTOM.md does state:

> Asynchronous keywords can return promise that rejects with `new Ajv.ValidationError(errors)`, where errors is an array of custom validation errors (...)

Which I think I'm doing but the validation still passes though it should be failing, _can you help me with this_?

**What version of Ajv are you using?**
6.0.0-rc.1

**JSON Schema**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Is child term of.",
  "$async": true,

  "type": "object",
  "properties": {
    "attributes": {
      "type": "object",
      "properties": {
        "sex": {
          "type": "array",
          "minItems": 1,
          "items": {
            "properties": {
              "value": {
                "type": "string",
                "minLength": 1
              },
              "units": {"type": "string"},
              "terms": {
                "type": "array",
                "items": {
                  "type": "string",
                  "format": "url"
                },
                "isChildTermOf": {
                  "parentTerm": "http://purl.obolibrary.org/obo/PATO_0000047",
                  "ontology": "pato"
                }
              }
            }
          }
        }
      }
    }
  }
}
```

**Sample data**
```json
{
  "$async": true,
  "attributes": {
    "sex": [{
      "value": "female",
      "terms":[
        "http://purl.obolibrary.org/obo/PATO_0000001"
      ]
    }]
  }
}
```

**isChildTermOf keyword implementation**
```javascript
'use strict';

var Ajv = require('ajv');
var request = require('request');

module.exports = function defFunc(ajv) {
  defFunc.definition = {
    async: true,
    type: 'array',
    validate: findChildTerms,
    errors: true
  };

  function findChildTerms(schema, data) {
    return new Promise( function(resolve, reject) {
      const parentTerm = schema.parentTerm;
      const ontology = schema.ontology;
      const olsSearchUrl = "https://www.ebi.ac.uk/ols/api/search?q=";

      if (findChildTerms.errors === null) {
        findChildTerms.errors = [];
      }

      let errorCount = 0;
      for (var i = 0; i < data.length; i++) {
        const termUri = encodeURIComponent(data[i]);
        const url = olsSearchUrl + termUri
        + "&exact=true&groupField=true&allChildrenOf=" + encodeURIComponent(parentTerm)
        + "&ontology=" + ontology + "&queryFields=iri";

        request(url, function(error, response, body) {
          let jsonBody = JSON.parse(body);
          if(jsonBody.response.numFound === 1) {
            resolve(true);
          } else if(jsonBody.response.numFound === 0) {
            findChildTerms.errors.push({
              keyword: 'isChildTermOf',
              message: 'is not child term of ' + parentTerm,
              params: {keyword: 'isChildTermOf'}
            });
            errorCount++;
            if (errorCount === termsArray.length) {
              reject(new Ajv.ValidationError(findChildTerms.errors));
            }
          } else {
            findChildTerms.errors.push({
              keyword: 'isChildTermOf',
              message: 'Something went wrong while validating term, try again.',
              params: {keyword: 'isChildTermOf'}
            });
            errorCount++;
            if (errorCount === termsArray.length) {
              reject(new Ajv.ValidationError(findChildTerms.errors));
            }
          }
        });
      }
    });
  }

  ajv.addKeyword('isChildTermOf', defFunc.definition);
  return ajv;
};
```

**What results did you expect?**
I expected it to fail