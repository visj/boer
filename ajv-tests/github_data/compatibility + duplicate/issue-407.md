# [407] 'ng serve' error cannot find module ajv

After installing Angular2-cli
With node.js 6.5.0 and npm 3.10.3

Attempted: 

bofcarbon1:~/workspace (master) $ ng serve

Resulted in error:

Cannot find module 'ajv'
Error: Cannot find module 'ajv'
    at Function.Module._resolveFilename (module.js:455:15)
    at Function.Module._load (module.js:403:25)
    at Module.require (module.js:483:17)
    at require (internal/module.js:20:19)
    at Object.<anonymous> (/home/ubuntu/workspace/node_modules/angular-cli/node_modules/extract-text-webpack-plugin/schema/validator.js:1:73)
    at Module._compile (module.js:556:32)
    at Object.Module._extensions..js (module.js:565:10)
    at Module.load (module.js:473:32)
    at tryModuleLoad (module.js:432:12)
    at Function.Module._load (module.js:424:3)
    at Module.require (module.js:483:17)
    at require (internal/module.js:20:19)
    at Object.<anonymous> (/home/ubuntu/workspace/node_modules/angular-cli/node_modules/extract-text-webpack-plugin/index.js:12:20)
    at Module._compile (module.js:556:32)
    at Object.Module._extensions..js (module.js:565:10)
    at Module.load (module.js:473:32)
    at tryModuleLoad (module.js:432:12)
    at Function.Module._load (module.js:424:3)
    at Module.require (module.js:483:17)
    at require (internal/module.js:20:19)
    at Object.<anonymous> (/home/ubuntu/workspace/node_modules/angular-cli/models/webpack-build-common.js:11:25)
    at Module._compile (module.js:556:32)
    at Object.Module._extensions..js (module.js:565:10)
    at Module.load (module.js:473:32)
    at tryModuleLoad (module.js:432:12)
    at Function.Module._load (module.js:424:3)
    at Module.require (module.js:483:17)
    at require (internal/module.js:20:19)
    at Object.<anonymous> (/home/ubuntu/workspace/node_modules/angular-cli/models/index.js:5:10)
    at Module._compile (module.js:556:32)
    at Object.Module._extensions..js (module.js:565:10)
    at Module.load (module.js:473:32)
    at tryModuleLoad (module.js:432:12)
    at Function.Module._load (module.js:424:3)
    at Module.require (module.js:483:17)
    at require (internal/module.js:20:19)
    at Object.<anonymous> (/home/ubuntu/workspace/node_modules/angular-cli/tasks/serve-webpack.js:9:10)
    at Module._compile (module.js:556:32)
    at Object.Module._extensions..js (module.js:565:10)
    at Module.load (module.js:473:32)
    at tryModuleLoad (module.js:432:12)
    at Function.Module._load (module.js:424:3)
    at Module.require (module.js:483:17)
    at require (internal/module.js:20:19)
    at Object.<anonymous> (/home/ubuntu/workspace/node_modules/angular-cli/commands/serve.run.js:6:23)
    at Module._compile (module.js:556:32)
    at Object.Module._extensions..js (module.js:565:10)
    at Module.load (module.js:473:32)
    at tryModuleLoad (module.js:432:12)
    at Function.Module._load (module.js:424:3)
    at Module.require (module.js:483:17)
    at require (internal/module.js:20:19)
    at Class.run (/home/ubuntu/workspace/node_modules/angular-cli/commands/serve.js:80:16)
    at Class.<anonymous> (/home/ubuntu/workspace/node_modules/angular-cli/ember-cli/lib/models/command.js:147:17)
    at process._tickCallback (internal/process/next_tick.js:103:7)
bofcarbon1:~/workspace (master) $ 

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
ajv 11.2 

Results did you expect?**
I was expected the server to start up without errors.  

**Are you going to resolve the issue?**
I am trying to resolve this issue 
I made sure the Ajv was installed
I have just trying to get an Angular project built with the proper
dependencies that include web pack version 26.

