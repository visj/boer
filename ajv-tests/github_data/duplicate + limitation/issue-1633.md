# [1633] Maximum call stack size exceeded error with large schemas

I was attempting to validate a schema with a large number (~3000) of top-level properties keys and got a "Maximum call stack size exceeded" error. I don't work a lot in the Node/JS ecosystem, but based on a little bit of Googling I was able to work around it by passing `--stack-size=16000` but based on a little bit I read I feel like that is just that - a work-around and not a proper fix. Also, I don't seem to be able to set `--stack-size` with the `NODE_OPTIONS` environment variable which makes it a touch trickier to use when the invocation of `node` is wrapped in a script that I don't control.

I have a reproduction at runkit: <https://runkit.com/seanmil/60b4d46dad647c001a9dd79a#> using Node v15.14 and Ajv 8.5.0.

My actual schema is quite a bit more complex than the simple example above, but it seems to be triggered primarily/only based on property count, not complexity.

Thanks!