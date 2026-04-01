# [1758] Make CI / tests compatible with npm 7 and node 16

Currently, probably because of the way Ajv has to `npm link ajv` itself, it does not work with npm 7.

Some other solution or maybe npm parameters are required to make it work.