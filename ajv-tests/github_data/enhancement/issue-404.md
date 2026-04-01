# [404] Use sh instead of bash

We've ran into an issue where using `ajv` with the alpine base in Docker causes a crash that does not happen in the debian base (see https://github.com/nodejs/docker-node/issues/288). I have not been able to create a minimal reproducer, so I was hoping that running the tests against the alpine base would shed some light on the issue (unfortunately it didn't).

However, in order to get the tests to run, I had to switch the shell scripts from using `bash` to `sh`, and since there's not `bash` specific functionality in the scripts, they can be switched to `sh` without any issues. Here's the `Dockerfile` that I used to run the tests and if this were changed, then the `sed` would not be necessary:
```
FROM node:6.9.4-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN apk add --no-cache git
RUN git clone https://github.com/epoberezkin/ajv.git .

RUN npm install --quiet
RUN git submodule update --init

RUN for f in scripts/bundle scripts/prepare-tests; do sed -i "s/bash/sh/" $f; done

CMD [ "npm", "test" ]
```

I ran these commands to build the container and run the tests:
```
docker build -t test_ajv .
docker run --rm test_ajv
```

It's probably also worth noting that the `test-karma` times out because PhantomJS isn't working with Alpine Linux (see https://github.com/ariya/phantomjs/issues/14186).