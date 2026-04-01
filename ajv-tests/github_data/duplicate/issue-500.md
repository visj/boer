# [500] The validation error for forbidden additionalProperties should include the additional properties name

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Using 4.x, I think the issue is still present in 5.x but have not yet migrated my project to 5.x to verify.


**Validation result, data AFTER validation, error messages**

Currently I will get a validation error like the following when my input data has additional properties and I've selected in the schema file that those are not allowed (some fields excluded for conciseness).

```
[{"keyword":"additionalProperties","dataPath":".test","message":"should NOT have additional properties"}]
```

**What results did you expect?**
Instead of a generic message, I would like to additionally see the name of the field, so I can more easily resolve the issue in my application (either by adding the field to my schema, or removing the extra field in the data).

So for example if I added a field named `foo` that isn't defined in the schema, I would see an error like this:
```
[{"keyword":"additionalProperties","dataPath":".test","message":"should NOT have additional properties: foo"}
```
**Are you going to resolve the issue?**

Absolutely, that is my intention!

I've tested the following change with 4.x and verified it includes the additional property name:
```
diff --git a/lib/dot/errors.def b/lib/dot/errors.def
index 3e04721..ac5994b 100644
--- a/lib/dot/errors.def
+++ b/lib/dot/errors.def
@@ -93,7 +93,7 @@
 {{## def._errorMessages = {
   $ref:            "'can\\\'t resolve reference {{=it.util.escapeQuotes($schema)}}'",
   additionalItems: "'should NOT have more than {{=$schema.length}} items'",
-  additionalProperties: "'should NOT have additional properties'",
+  additionalProperties: "'should NOT have additional properties: {{=$additionalProperty}}'",
```