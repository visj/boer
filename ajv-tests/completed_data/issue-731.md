# [731] oneOf Validation fails for { "type": "boolean" }

**Summary:** The oneOf keyword does not validate on boolean values (true and false). I have provided a gist below to reproduce the issue with the latest version of AJV. All you need to do is copy paste these files in a folder, and run `npm i && npm start` :) 

**AJV version:** 6.2.1
**gist:** https://gist.github.com/philippefutureboy/7335eef43a887e41a80039fc073c23f6

**Validation result, data AFTER validation, error messages**
```
[{"keyword":"oneOf","dataPath":".constraints.FOREIGN_KEY","schemaPath":"#/properties/constraints/properties/FOREIGN_KEY/oneOf","params":{"passingSchemas":[0,1]},"message":"should match exactly one schema in oneOf"}]
```

**What results did you expect?**
Validation to pass for both of the oneOf scenarios (both the object and the boolean).

**Are you going to resolve the issue?**
Unfortunately not.

Thanks for this wonderful JSON validator 🚀