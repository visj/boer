# [1406] Improve discoverability in docs

I am really unhappy with how the docs are hiding the validation keywords.
Now you need to search the whole docs to find them.

**Repro:**
1) You need to scroll 1/3 of the [ajv homepage](https://ajv.js.org/)
2) Find it in the list of content
```
Data validation
Validation basics: **JSON Schema keywords**, annotations, formats
```
3) Search another list of contents
```
Data validation
  JSON Schema draft-2019-09
  Validation basics
     **JSON Schema validation keywords**
```
4) Search in the text and find a link for the keywords
```
Ajv supports all validation keywords from draft-07 of JSON Schema standard - see **JSON Schema validation keywords** for more details.
```
5) Scroll down to a list of keywords
6) Click on a keyword
🎉 You have finally found keywords for a type ... 

So after all I have to click "JSON Schema keywords" 3x before I finally get to that page 😞 