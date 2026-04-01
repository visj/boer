# [881] $data refrenece - how is it supposed to work?

Hello,

I try to use the data reference feature.

I started from a node:10 docker
Dockerfile
```
FROM node:10
WORKDIR /home
ADD *.json /home/
RUN apt-get update
CMD ["bash"]
```

started the docker and nstalled ajv-cli on the bash via

```
npm install -g epoberezkin/ajv-cli
...
+ ajv-cli@1.0.0
added 40 packages from 60 contributors in 8.285s
```

I have two jsons from the example

i.json
```
{
    "smaller": 5,
    "larger": 7
}
```

s.json
```
{
    "properties": {
        "smaller": {
        "type": "number",
        "maximum": { "$data": "1/larger" }
        },
        "larger": { "type": "number" }
    }
}
```

The schema seems not allowing the data reference.
```
# ajv -s s.json -d i.json
schema s.json is invalid
error: schema is invalid: data.properties['smaller'].maximum should be number
#
```

It seems the epoberezkin/ajv is not used when installing epoberezkin/ajv-cli.

Any hint anyone?

Thanks for your help.

Regards
Ralf 
