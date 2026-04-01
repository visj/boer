# [917] Bad URI in data for definitions does not generate corresponding error in errors.

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- browser/compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

6.4.0

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
I don't see one.

```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

I think the easiest thing to test is add a | to a URI or definition and then make sure that it doesn't pass Ajv
```json                                                                                                                                                                          "-foo": {                                                                                                                                                                  "$ref": "#/definitions/-Sphere\|Box\|ConeSFNode"                                                                                                            }
--



```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json

Reference -foo some where, and create the right definition.

"-foo": {                                                                                                                                                            "$ref": "#/definitions/-Sphere\|Box\|ConeSFNode"                                                                                                                                },
--



"-Sphere\|Box\|ConeSFNode": {                                                                                                                                                       "type": "object",                                                                                                                                                               "properties": {                                                                                                                                                                   "Sphere": {                                                                                                                                                                       "$ref": "#/definitions/Sphere"                                                                                                                                                },                                                                                                                                                                              "Box": {                                                                                                                                                                          "$ref": "#/definitions/Box"                                                                                                                                                   },                                                                                                                                                                              "Cone": {                                                                                                                                                                         "$ref": "#/definitions/Cone"                                                                                                                                                  },                                                                                                                                                                              "ProtoInstance": {                                                                                                                                                                "$ref": "#/definitions/ProtoInstance"                                                                                                                                         }                                                                                                                                                                             },                                                                                                                                                                              "additionalProperties": false                                                                                                                                                 },
--



```


**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/epoberezkin/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript

// Ajv did not report an error.   Org.everit did.
```


**Validation result, data AFTER validation, error messages**

```
    */


Caused by: java.net.URISyntaxException: Illegal character in fragment at index 21: #/definitions/-Sphere\|Box\|ConeSFNode                                                                 at java.base/java.net.URI$Parser.fail(Unknown Source)                                                                                                                           at java.base/java.net.URI$Parser.checkChars(Unknown Source)                                                                                                                     at java.base/java.net.URI$Parser.parse(Unknown Source)                                                                                                                          at java.base/java.net.URI.(Unknown Source)                                                                                                                                at org.everit.json.schema.loader.internal.ReferenceResolver.resolve(ReferenceResolver.java:26)                                                                                  ... 371 more                                                                                                                                                            Exception in thread "main" java.lang.RuntimeException: java.net.URISyntaxException: Illegal character in fragment at index 27: #/definitions/-NurbsCurve2D\|ContourPolyline2DMFNode
--



```

**What results did you expect?**

Expected an error such as the Java one from everit above.  A character such a -, |, etc is not expected, and the schema should be fixed.  Welcome changes to JSON schema.

**Are you going to resolve the issue?**

Not yet.  May get to it if we change the autogenerated JSON schema (removing our schema issue). For Ajv, seems pretty easy to check for a URI regex and send report an Ajv error instead (if there is one in the (URI/definition).  We just need to make sure definitions meet a certain criteria, I think but not really sure.

Sorry for such a bad bug report.  I'm in a bit of pain. Trying to work in pain.  I will try another one of the links.   I may get to one later.  Going to everit to report Exception, but it seems like they don't need to do anything, and Ajv does (false positive).

Please try to throw an error when there's a bad URI?  Not sure exactly

Here are some of the caused by's in Everit:



Caused by: java.net.URISyntaxException: Illegal character in fragment at index 21: #/definitions/-Sphere\|Box\|ConeSFNode                                                         Caused by: java.net.URISyntaxException: Illegal character in fragment at index 27: #/definitions/-NurbsCurve2D\|ContourPolyline2DMFNode                                          Caused by: java.net.URISyntaxException: Illegal character in fragment at index 21: #/definitions/-Sphere\|Box\|ConeSFNode                                                         Caused by: java.net.URISyntaxException: Illegal character in fragment at index 27: #/definitions/-NurbsCurve2D\|ContourPolyline2DMFNode                                          Caused by: java.net.URISyntaxException: Illegal character in fragment at index 27: #/definitions/-NurbsCurve2D\|ContourPolyline2DMFNode                                          Caused by: java.net.URISyntaxException: Illegal character in fragment at index 27: #/definitions/-NurbsCurve2D\|ContourPolyline2DMFNode                                          Caused by: java.net.URISyntaxException: Illegal character in fragment at index 27: #/definitions/-NurbsCurve2D\|ContourPolyline2DMFNode                                          Caused by: java.net.URISyntaxException: Illegal character in fragment at index 21: #/definitions/-Sphere\|Box\|ConeSFNode                                                         Caused by: java.net.URISyntaxException: Illegal character in fragment at index 27: #/definitions/-NurbsCurve2D\|ContourPolyline2DMFNode                                          Caused by: java.net.URISyntaxException: Illegal character in fragment at index 21: #/definitions/-Sphere\|Box\|ConeSFNode                                                         Caused by: java.net.URISyntaxException: Illegal character in fragment at index 21: #/definitions/-Sphere\|Box\|ConeSFNode                                                         Caused by: java.net.URISyntaxException: Illegal character in fragment at index 27: #/definitions/-NurbsCurve2D\|ContourPolyline2DMFNode                                          Caused by: java.net.URISyntaxException: Illegal character in fragment at index 27: #/definitions/-NurbsCurve2D\|ContourPolyline2DMFNode                                          Caused by: java.net.URISyntaxException: Illegal character in fragment at index 27: #/definitions/-NurbsCurve2D\|ContourPolyline2DMFNode                                          Caused by: java.net.URISyntaxException: Illegal character in fragment at index 27: #/definitions/-NurbsCurve2D\|ContourPolyline2DMFNode                                          Caused by: java.net.URISyntaxException: Illegal character in fragment at index 21: #/definitions/-Sphere\|Box\|ConeSFNode                                                         Caused by: java.net.URISyntaxException: Illegal character in fragment at index 21: #/definitions/-Sphere\|Box\|ConeSFNode                                                         Caused by: java.net.URISyntaxException: Illegal character in fragment at index 21: #/definitions/-Sphere\|Box\|ConeSFNode
--


