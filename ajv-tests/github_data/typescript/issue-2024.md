# [2024] addKeyword expects 2 paramters according to typescript but give a deprecation error

addKeyword wants a type and the config as two parameters. When I do that I am getting an error `these parameters are deprecated, see docs for addKeyword`.

Using 8.11.0 (latest fasitfy)

works but has typescript error:
```
          ajv.addKeyword({
              keyword: 'isFileType',
              type: 'object',
              compile: (schema, parent, it) => {
                  parent.type = 'file';
                  delete parent.isFileType;
                  return () => true;
              },
          });
```

no typescript error but deprecation error:
```
          ajv.addKeyword( 'isFileType', {
              compile: (schema, parent, it) => {
                  parent.type = 'file';
                  delete parent.isFileType;
                  return () => true;
              },
          });
```
