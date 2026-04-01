# [1292] Error says duplicates on data/required but none found

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/ajv/6.12.4/ajv.min.js" integrity="sha512-jT80r/QIunAH3Bng0028a3kMjhpr+ApSrAjshiM+0+6s/O01//jwogIby3WnFle7UxDas+/gf3BgI4Rjju17ww==" crossorigin="anonymous"></script>

```



**Ajv options object**

<!-- See https://github.com/ajv-validator/ajv#options -->

```javascript
{allErrors: true, jsonPointers: true}

```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
"$schema": "http://json-schema.org/draft-07/schema#",
"type": "object",
"properties": {
"name": {
"description": "Descriptive name of the dataset",
"type": "string"
},
"description": {
"description": "Longer description of what is contained in the dataset",
"type": "string"
},
"author": {
"description": "Name of the author or organization that created the dataset.  Note: schema.org/author and schema.org/organization have additional fields that can provide more information about the author/organization, if desired.",
"anyOf": [
{
"$ref": "#/definitions/person"
},
{
"type": "array",
"items": {
"$ref": "#/definitions/person"
}
},
{
"$ref": "#/definitions/organization"
},
{
"type": "array",
"items": {
"$ref": "#/definitions/organization"
}
}
]
},
"license": {
"description": "A license document that applies to this content, typically indicated by a URL.",
"type": "string"
},
"cost": {
"description": "Specify the cost to obtain the dataset, \"Free\", \"Subscription\" or others",
"type": "string"
},
"url": {
"description": "The main URL about the dataset",
"type": "string",
"format": "uri"
},
"identifier": {
"description": "identifier for the dataset in a shared repository (GEO, Zenodo, figshare, etc)",
"type": "string"
},
"contain_geo_codes": {
"description": "Does the dataset contains GEO codes (e.g. zip codes)?",
"type": "boolean"
},
"contain_phi": {
"description": "Does the dataset contains Protected health information (PHI)?",
"type": "boolean"
},
"justification": {
"description": "How is the dataset relevant to the N3C project, why does the community want and how can it be used?",
"type": "string"
},
"doi": {
"description": "The DOI for the dataset if available",
"type": "string"
},
"contact": {
"description": "Provide an email contact",
"type": "string"
},
"documentation": {
"description": "Provide the URL to the detailed documentation about the dataset",
"type": "string",
"format": "uri"
},
"funding": {
"description": "Funding that supports (sponsors) the collection of this dataset through some kind of financial contribution",
"oneOf": [
{
"$ref": "#/definitions/funding"
},
{
"type": "array",
"items": {
"$ref": "#/definitions/funding"
}
}
]
},
"keywords": {
"description": "A list of keywords associated with this dataset",
"oneOf": [
{
"type": "string"
},
{
"type": "array",
"items": {
"type": "string"
}
}
]
},
"measurementTechnique": {
"description": "A technique or technology used in a Dataset, corresponding to the method used for measuring the corresponding variable(s).",
"oneOf": [
{
"$ref": "#/definitions/controlledVocabulary"
},
{
"type": "array",
"items": {
"$ref": "#/definitions/controlledVocabulary"
}
}
]
},
"standards_used": {
"description": "A list of standards used in the dataset, e.g. OMOP.",
"oneOf": [
{
"type": "string"
},
{
"type": "array",
"items": {
"type": "string"
}
}
]
},
"citation": {
"description": "A citation to the dataset",
"oneOf": [
{
"$ref": "#/definitions/citation"
},
{
"type": "array",
"items": {
"$ref": "#/definitions/citation"
}
}
]
},
"release_frequency": {
"description": "How frequent is the new version of the dataset released (monthly, quarterly, etc)",
"type": "string"
},
"comment": {
"description": "Any other comments about this dataset?",
"type": "string"
},
"includedInDataCatalog": {
"description": "Data catalog(s) which contain this dataset.",
"oneOf": [
{
"$ref": "#/definitions/inclusionObject"
},
{
"type": "array",
"items": {
"$ref": "#/definitions/inclusionObject"
}
}
]
}
},
"required": [
"name",
"description",
"author",
"license",
"cost",
"url",
"identifier",
"contain_geo_codes",
"contain_phi",
"justification"
],
"definitions": {
"controlledVocabulary": {
"description": "collection of vocabulary terms defined in ontologies",
"@type": "CreativeWork",
"type": "string",
"vocabulary": {
"ontology": [
"efo",
"ncit",
"obi"
],
"children_of": [
"https://www.ebi.ac.uk/efo/EFO_0002694",
"http://purl.obolibrary.org/obo/NCIT_C20368",
"http://purl.obolibrary.org/obo/OBI_0000011"
]
},
"strict": false
},
"moreControlledVocabulary": {
"definition": "collection of vocabulary terms defined in ontologies",
"@type": "CreativeWork",
"type": "string",
"strict": false,
"vocabulary": {
"ontology": [
"efo",
"cido",
"epo",
"covid19"
],
"children_of": [
"https://www.ebi.ac.uk/efo/EFO_0001444",
"http://purl.obolibrary.org/obo/cido.owl",
"http://purl.obolibrary.org/obo/epo",
"https://bioportal.bioontology.org/ontologies/COVID19"
]
}
},
"baseOrgObject": {
"description": "A barebones Organization object to work around recursion issues in DDE",
"@type": "Organization",
"type": "object",
"properties": {
"name": {
"description": "name of the organization",
"type": "string"
},
"alternateName": {
"description": "Alternate name or Acronym for the organization.",
"type": "string"
}
},
"required": [
"name"
]
},
"person": {
"description": "Reusable person definition",
"@type": "Person",
"type": "object",
"properties": {
"name": {
"type": "string"
},
"givenName": {
"type": "string"
},
"familyName": {
"type": "string"
},
"orcid": {
"type": "string"
},
"affiliation": {
"oneOf": [
{
"$ref": "#/definitions/baseOrgObject"
},
{
"type": "array",
"items": {
"$ref": "#/definitions/baseOrgObject"
}
}
]
}
},
"required": [
"name"
]
},
"memberObject": {
"description": "Reusable person definition accounting for recursion issues in DDE",
"@type": "Person",
"type": "object",
"properties": {
"name": {
"type": "string"
},
"givenName": {
"type": "string"
},
"familyName": {
"type": "string"
},
"orcid": {
"type": "string"
},
"affiliation": {
"oneOf": [
{
"$ref": "#/definitions/baseOrgObject"
},
{
"type": "array",
"items": {
"$ref": "#/definitions/baseOrgObject"
}
}
]
}
},
"required": [
"name"
]
},
"organization": {
"description": "Reusable organization definition",
"@type": "Organization",
"type": "object",
"properties": {
"name": {
"type": "string"
},
"alternateName": {
"type": "string"
},
"affiliation": {
"$ref": "#/definitions/baseOrgObject"
},
"members": {
"oneOf": [
{
"$ref": "#/definitions/memberObject"
},
{
"type": "array",
"items": {
"$ref": "#/definitions/memberObject"
}
}
]
}
},
"required": [
"name"
]
},
"funding": {
"type": "object",
"@type": "MonetaryGrant",
"description": "Information about funding support",
"properties": {
"name": {
"type": "string",
"description": "The name of the monetary grant that funded/funds the Dataset"
},
"identifier": {
"type": "string",
"description": "Unique identifier(s) for the grant(s) used to fund the Dataset"
},
"funder": {
"description": "name of the funding organization",
"oneOf": [
{
"$ref": "#/definitions/baseOrgObject"
},
{
"type": "array",
"items": {
"$ref": "#/definitions/baseOrgObject"
}
}
]
},
"url": {
"type": "string",
"format": "uri",
"description": "award URL"
}
},
"required": [
"funder"
]
},
"citation": {
"description": "A citation object for a resource which is cited by the dataset (ie- is a derivative of the dataset) , related to the dataset, or from which the dataset was based on (ie- is derived from).",
"@type": "Thing",
"type": "object",
"properties": {
"name": {
"description": "Name of or title of the citation",
"type": "string"
},
"identifier": {
"description": "An identifier associated with the citation",
"type": "string"
},
"pmid": {
"description": "A pubmed identifier if available",
"type": "string"
},
"doi": {
"description": "A doi if available",
"type": "string"
},
"url": {
"description": "The url of the resource cited.",
"type": "string",
"format": "uri"
},
"citeText": {
"description": "The bibliographic citation for the referenced resource as is provided",
"type": "string"
}
},
"required": [
"name"
]
},
"inclusionObject": {
"description": "A data catalog which contains this dataset.",
"type": "object",
"properties": {
"name": {
"const": "N3C Datasets"
},
"url": {
"const": "https://ncats.nih.gov/n3c/"
}
}
}
}
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
  "@type": "n3c:Dataset",
  "@context": {
    "schema": "http://schema.org/",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "bts": "http://schema.biothings.io/",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "owl": "http://www.w3.org/2002/07/owl/",
    "niaid": "https://discovery.biothings.io/view/niaid/",
    "outbreak": "https://discovery.biothings.io/view/outbreak/",
    "n3c": "http://discovery.biothings.io/"
  },
  "name": "name",
  "description": "some description",
  "author": {
    "@type": "Person",
    "name": "First Last",
    "givenName": "First",
    "familyName": "Last",
    "orcid": "abc123",
    "affiliation": {
      "name": "company",
      "alternateName": "otherName"
    }
  },
  "license": "CC0",
  "cost": "some text",
  "url": "myurl.com",
  "identifier": "fdsaffdsaf",
  "contain_geo_codes": "true",
  "contain_phi": "true",
  "justification": "fdsafasdfasdk fhsl flk sdalkfjkl"
}

```


**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/ajv-validator/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
var ajv = new Ajv({allErrors: true, jsonPointers: true});
        // ajv.addMetaSchema()
        var schema = state.schema.validation
        var data = state.output
        
        const isValid = ajv.validate(schema, data); //schema, data
        if(! isValid){
          // console.log('%c ***** VALIDATION DETAILS *****','color:pink')
          // console.log("NOT VALID ",ajv.errors);
          state.valid = false;
          state.errors = ajv.errors;
        }else {
          // console.log('%c ***** VALIDATION RESULT *****','color:limegreen')
          // console.log(isValid)
          state.valid = true;
          state.errors = []
        }

```


**Validation result, data AFTER validation, error messages**

```
Uncaught Error: schema is invalid: data/required should NOT have duplicate items (items ## 10 and 6 are identical)

```

**What results did you expect?**
I don't see any duplicates on required or on the data being validated so I would expect it to validate

**Are you going to resolve the issue?**
I've tried adding older meta schemas with addMetaSchema but with no luck. I need help
