# [299] Multilingual meta data

**What version of Ajv you are you using?**
4.7.0

**What problem do you want to solve?**
Title&Description localization. HTTP Accept-Language is not a good solution for transferring schemas localized to multiple languages. 

**What do you think is the correct solution to problem?**
First option from:
https://github.com/json-schema/json-schema/wiki/Multilingual-meta-data-(v5-proposal)

First option would also be compatible with https://www.w3.org/TR/json-ld/#dfn-language-map for example:

```
{
  "@context":
  {
    ...
    "title": { "@id": "dcterms:title", "@container": "@language" }
  },
  "title":
  {
    "ja": "忍者",
    "en": "Ninja",
    "cs": "Nindža"
  }
  ...
}
```

**Will you be able to implement it?**
No
