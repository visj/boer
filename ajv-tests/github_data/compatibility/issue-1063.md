# [1063] TypeError: it.self.getKeyword is not a function 

I'm debugging an error that is thrown in my webpack dev-server since the latest update.
The error thrown is:
```
TypeError: it.self.getKeyword is not a function
    at Ajv.generate_errorMessage (/srv/codepad-project/var/vue/node_modules/ajv-errors/lib/dotjs/errorMessage.js:18:27)
    at Object.useCustomRule (/srv/codepad-project/var/vue/node_modules/ajv/lib/compile/index.js:203:25)
    at generate_validate (/srv/codepad-project/var/vue/node_modules/ajv/lib/dotjs/validate.js:198:38)
    at localCompile (/srv/codepad-project/var/vue/node_modules/ajv/lib/compile/index.js:53:22)
    at Ajv.compile (/srv/codepad-project/var/vue/node_modules/ajv/lib/compile/index.js:42:10)
    at _compile (/srv/codepad-project/var/vue/node_modules/ajv/lib/ajv.js:294:29)
    at Ajv.validate (/srv/codepad-project/var/vue/node_modules/ajv/lib/ajv.js:88:33)
    at validateOptions (/srv/codepad-project/var/vue/node_modules/webpack-dev-server/node_modules/schema-utils/src/validateOptions.js:31:12)
    at new Server (/srv/codepad-project/var/vue/node_modules/webpack-dev-server/lib/Server.js:62:5)
    at serve (/srv/codepad-project/var/vue/node_modules/@vue/cli-service/lib/commands/serve.js:139:20)
```
Unfortunately, I could not isolate a set of options and schemas, etc to have an easy way to reproduce the issue. As soon as I extract data to files, and load them for validations, they appear to be valid, and the code execution don't progress to ajv-errors.

Could someone address this issue, and help me bughunting?
I think it is not good that it crashes the whole process, it should tell why validation fails in the input-data or in the environment the code is running in. I'm not convinced that the input-data is relevant here, it appears to be valid. Actually, if I override the $config variable in generate_errorMessage, as a temporary workaround, it works fine.

Any suggestions welcome, not sure what to do next to narrow down the issue. I suspect that code behaves somehow different in my environment. ..