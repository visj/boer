# [514] Cannot find module '../dotjs/validate/

Hi,

I am facing with the problem:


Error: Cannot find module '../dotjs/validate'
    at Function.Module._resolveFilename (module.js:469:15)
    at Function.Module._load (module.js:417:25)
    at Module.require (module.js:497:17)
    at require (internal/module.js:20:19)
    at Object.<anonymous> (C:\Users\user-pc\Desktop\pluralsight\nodejs\module2\node_modules\ajv\lib\compile\index.js:18:25)
    at Module._compile (module.js:570:32)
    at Object.Module._extensions..js (module.js:579:10)
    at Module.load (module.js:487:32)
    at tryModuleLoad (module.js:446:12)
    at Function.Module._load (module.js:438:3)


Using latest AJV version. Don't know why does it occur. But note that I am installing modules manually because of some proxy problems but I have installed all dependencies as well. Could you help with this issue please?
