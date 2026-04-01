# [322] Pass options to validate function at runtime

Thanks for making this awesome library.

We have a use case that need to do both following operations given a schema
- validate & filter data with compile time option `removeAdditional: true`
- dry run above process without actually removing fields, just to see whether there are errors

We were on v4.0.6 and the approach we took was to compile two validate functions for each schema, one with `removeAdditional: true` and the other with `removeAdditional: 'dryRun'` and modify [related part in properties.jst](https://github.com/epoberezkin/ajv/blob/master/lib/dot/properties.jst#L94-L97) into following:

```
       {{? $noAdditional }}
         {{? $removeAdditional === 'dryRun' }}
         {{?? $removeAdditional }}
           delete {{=$data}}[key{{=$lvl}}];
         {{??}}
```

It works pretty well except doubling the number of validators in memory. We're looking into ways to turn dry run from compile time option into runtime/validation time option to reduce memory usage:

``` js
var ajv = new Ajv({removeAdditional: true});
var validate = ajv.compile(schema);
// actually removing fields
validate(data);
// dry run
validate(
  data,
  /*dataPath*/,
  /*parentData*/,
  /*parentDataProperty*/,
  /*option e.g. {dryRun: true}*/
); 
```

Got lost a few times on how to pass that runtime option to sub/referenced validate functions(recursively?). Could you give some hints on how to do that properly, or is there a better way to do that at runtime?
