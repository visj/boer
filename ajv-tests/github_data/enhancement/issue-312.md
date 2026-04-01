# [312] Hostname Format Regex Failure

The following fails the `hostname` format regex:

```
lead-routing-qa.lvuucj.0001.use1.cache.amazonaws.com
```

I did a quick SO search and found this regex, which works on the above host:

``` javascript
/^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/
```

http://stackoverflow.com/a/106223

Full error:

``` javascript
[ { keyword: 'format',
    dataPath: '.services[\'lead-matching\'].redis.databases[0].host',
    schemaPath: '#/properties/services/properties/lead-matching/allOf/0/properties/redis/properties/databases/items/properties/host/format',
    params: { format: 'hostname' },
    message: 'should match format "hostname"' } ]
```

AJV version: `4.7.4`
