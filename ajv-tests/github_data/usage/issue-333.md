# [333] Use default in case of error

Hi, there is a way to use default value when an error is produced? Or it's used only in case of missing data?

for example: 
```

'prop': {
    'type':  ['number', 'null'],
    'default': null
},

data.prop = 'hello world'

```
