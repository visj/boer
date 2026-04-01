# [830] Attribute $id require URL with protocol part

### Ajv version
6.5.2

### Problem

A JSON schema has attribute **$id**. ajv just works when **$id** is specifies by URL format such as `protocol://domain/path` . If protocol part is removed then ajv does not works, it always provide `can't resolve reference...`.

### Question

Why don't remove protocol part from **$id** attribute?. protocol part is unnecessary.