# [79] Hints for more complex custom keywords

I would like to implement custom keyword, which allow to dispatch to different sub-schemas
based on value of some data attribute (for example data.type)

``` js
{schemaProperty: 'type',
 schemaMap: {
   Human: '#/definitions/Human',
   Hipster: '#/definitins/Hipster'}}
```

I've honestly spent half-day trying to do it by compile or inline, but definitely need your hints `how to make it work` :)
