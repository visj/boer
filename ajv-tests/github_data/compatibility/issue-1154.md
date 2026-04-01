# [1154] command not found: ajv

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for compatibility issues.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**The version of Ajv you are using**
- `"ajv": "^6.10.2"`

**The environment you have the problem with**
- It worked fine in MacOS, but ran into problems in GitLab's Docker CI, which image the Linux system.

**Your code (please make it as small as possible to reproduce the issue)**
- The relevant code snippet in the `package.json` :

```json
{
  "scripts": {
    "test:schema": "./src/schemas/schema-test.sh"
  },
  "devDependencies": {
    "ajv-cli": "^3.0.0"
  },
  "dependencies": {
    "ajv": "^6.10.2"
  }
}
```

- `.gitlab-ci.yml` file contents:

```yml
image: node:12

stages:
  - lint
  - test
  # - build

.yarn_install:
  before_script:
    - yarn config set @private:registry https://npm.private.io
    - echo "//npm.private.io/:_authToken=${NPM_TOKEN}" > ~/.npmrc
    - yarn install
    - export PATH="./node_modules/.bin:${PATH}"

prettier:
  stage: lint
  script:
    - yarn config set @private:registry https://npm.private.io
    - echo "//npm.private.io/:_authToken=${NPM_TOKEN}" > ~/.npmrc
    - yarn add prettier
    - yarn lint

schema test:
  stage: test
  script:
    - yarn test:schema

variables:
  GIT_DEPTH: 10
```

- `schema-test.sh` file contents:

```shell
#!/usr/bin/env bash

# Test all file ends with schema.json via ajv

CURRENT_DIR=`dirname "$0"`

cd $CURRENT_DIR

for SCHEMA_FILE in *.schema.json
do
    SAMPLE_FILE=samples/${SCHEMA_FILE/schema/sample}
    echo Schema file: $SCHEMA_FILE
    if [ -f $SAMPLE_FILE ]
    then
        echo Found sample file: $SAMPLE_FILE
        npx ajv -s $SCHEMA_FILE -d $SAMPLE_FILE
    else
        echo "*NO* sample file found for $SCHEMA_FILE"
    fi
done
```

**If your issue is in the browser, please list the other packages loaded in the page in the order they are loaded. Please check if the issue gets resolved (or results change) if you move Ajv bundle closer to the top**

- Non Browser

**Results in node.js v8+**

- Runtime on NodeJS 12+

**Results and error messages in your platform**

- Gitlab CI error message:

```
...
23 $ yarn test:schema
24 yarn run v1.21.1
25 $ ./src/schemas/schema-test.sh
26 Schema file: dev-assistant.schema.json
27 Found sample file: samples/dev-assistant.sample.json
28 npx: installed 6 in 1.124s
29 command not found: ajv
30 Schema file: form.schema.json
31 *NO* sample file found for form.schema.json
32 Schema file: news.schema.json
33 *NO* sample file found for news.schema.json
34 Schema file: repos.schema.json
35 Found sample file: samples/repos.sample.json
36 npx: installed 6 in 0.911s
37 command not found: ajv
38 Schema file: team-members.schema.json
39 Found sample file: samples/team-members.sample.json
40 npx: installed 6 in 0.902s
41 command not found: ajv
42 info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
43 error Command failed with exit code 1.
47 ERROR: Job failed: command terminated with exit code 1
```
Thank you for all of your help!