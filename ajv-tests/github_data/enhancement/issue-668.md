# [668] schemaId type definition does not include "auto"

Currently `schemaId` option is defined as follows:
```javascript
schemaId?: '$id' | 'id';
```
It should be updated to include the recently added "auto" mode:
```javascript
schemaId?: '$id' | 'id' | 'auto';
```