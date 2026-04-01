# [1759] Fix CI to build the website and to update ajv-dist

Website currently is disabled, it breaks the build: https://github.com/ajv-validator/ajv/blob/master/.github/workflows/build.yml#L25

ajv-dist update [failed](https://github.com/ajv-validator/ajv/runs/3080443051?check_suite_focus=true) with the last release: https://github.com/ajv-validator/ajv-dist/releases