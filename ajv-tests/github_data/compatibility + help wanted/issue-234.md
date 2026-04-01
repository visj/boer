# [234] How do I use ajv in Dojo?

I would like to use ajv in my Dojo web application, but cannot figure out how to include the ajv module and use it - when i tried to include it from the source code, it complains it could not find compile module

first I tried including this in my index.html
`<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/ajv/4.1.7/ajv.min.js"></script>
`  
but then I don't know what to do after? How to create Ajv object?  I tried the same as the getting started example but it does not work.

I also tried downloading the source code and in my dojo config I included the path to ajv in my packages like this

```
                packages: [
                    ...
                    { name: 'ajv', location: 'third_party/ajv-4.1.0' },
not 
                ],

```

and then in my script I require it like this

```
    <script>

        require(["ajv/ajv"], function (ajv) {

        });

        schema = {
            type: "object",
            properties: {
                name: { type: "number" },
                age: { type: "number" }
            }
        };

    </script>
```

But it just error out.

Any ideas how to do this?
