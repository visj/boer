# [1697] Validate method is taking long time to return values on large json data

I am creating a typescript npm package that will read json files (that have different types of data) and then validate their content against predefined `json-schemas`.

So for example I have this file, that has this kind of data (I have removed some of the objects just for the sake of the example if you want me to provide all the data please let me know) :

```
[
    {
        "numberVerification": [
            {
                "longNumber": 281474976710655
            }
        ]
    },
    {
        "metaData": [
            {
                "name": "nodes",
                "elementCount": 155,
                "idCounter": 155,
                "version": "1.0",
            },
            {
                "name": "edges",
                "elementCount": 312,
                "idCounter": 312,
                "version": "1.0",
            },
            {
                "name": "networkAttributes",
                "elementCount": 14,
                "idCounter": 14,
                "version": "1.0",
            },
            {
                "name": "nodeAttributes",
                "elementCount": 330,
                "idCounter": 330,
                "version": "1.0",
            },
            {
                "name": "edgeAttributes",
                "elementCount": 3120,
                "idCounter": 3120,
                "version": "1.0",
            },
            {
                "name": "cartesianLayout",
                "elementCount": 155,
                "idCounter": 156
            },
        ]
    },
    {
        "nodes": [
            {
                "@id": 0,
                "n": "TYK2",
                "r": "uniprot:P29597"
            },
            {
                "@id": 1,
                "n": "ISGF3 complex",
                "r": "signor:SIGNOR-C124"
            },
            {...}
        ]
    },
    {
        "edges": [
            {
                "@id": 0,
                "s": 0,
                "t": 1,
                "i": "up-regulates activity"
            },
            {
                "@id": 1,
                "s": 2,
                "t": 1,
                "i": "up-regulates activity"
            },
            {...}
        ]
    },
    {
        "nodeAttributes": [
            {
                "po": 0,
                "n": "type",
                "v": "protein"
            },
            {
                "po": 0,
                "n": "location",
                "v": "cytoplasm"
            },
            {...}
        ]
    },
    {
        "edgeAttributes": [
            {
                "po": 0,
                "n": "citation",
                "v": [
                    "pubmed:15120645"
                ],
                "d": "list_of_string"
            },
            {
                "po": 0,
                "n": "mechanism",
                "v": "phosphorylation"
            },
            {...}
        ]
    },
    {
        "cartesianLayout": [
            {
                "node": 0,
                "x": 97.73626669665249,
                "y": -114.99468800778627
            },
            {
                "node": 1,
                "x": 307.72737757573987,
                "y": 4.091777979752425
            },
            {...}
        ]
    },
    {
        "status": [
            {
                "error": "",
                "success": true
            }
        ]
    }
]
```
so I have created a schema for each object in the array (numberVerification, metadata, nodes, nodesAttributes...).
And then i have created a schema called `_network` that has all the other schemas as reference.

and because I want to get the location of the error I am using `json-source-map`
```
    const sourceMap = jsonMap.parse(networkFile);
    const data = sourceMap.data;
    const pointers = sourceMap.pointers;
```

and then I am creating a new ajv instance and then I validate against the data

```
  ajv = getAjvInstance();
  validate = getValidateInstance();
  console.log("start valdiating...");
  const valid = validate(data);

  if (!valid) {
    const errors = validate.errors?.filter(error => error.keyword === 'errorMessage');
    errors?.map((error) => {
        const errorPointer = pointers[error.instancePath];
        const splittedMessage = error.message!.split(':', 2);
        addError(splittedMessage[0], splittedMessage[1], [errorPointer]);
    });
  }
```

```
function getAjvInstance() {
  if (!ajv) {
    ajv = new Ajv({
      allErrors: true,
      strictTypes: false,
    });
    require('ajv-errors')(ajv);
  }
  return ajv;
}
```

```
function getValidateInstance() {
  if(!validate) {
    validate = ajv.compile(_network);
  }
  return validate;
}
```

**What version of Ajv you are you using?**
    "ajv": "^8.6.0",
    "ajv-errors": "^3.0.0",
    "json-source-map": "^0.6.1",

**What problem do you want to solve?**
When reading big json files (10MB or larger) the validation function freeze the terminal, so I am forced to kill the terminal using `Ctrl+C`, although  when trying it on data of size ~500Kb the performance was excellent and it return error messages as it should. 

**Note:** I am not using `$id` in any of the schemas, because I am not going to host the schemas online, so if there is an issue with that please let me know to update my schemas and retry, but I don't think that would solve the problem because the validation function worked with smaller files and it was returning data as it suppose but the problem only occurred when dealing with large files.


I can't tell for sure if the problem is related to the memory of the heap being exceeded because I am not getting any warning or error messages related to that.

If I have to provide any additional information please let me know, and thanks for creating such a wonderful library, I really appreciate the help.