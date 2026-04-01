# [509] "no schema" Error thrown

Hi,

First time user of AJV.  I'm trying to use extract-text-webpack-plugin that depends on AJV.  While this plugin is doing its thing during bundling my CSS output via webpack; AJV throws the error message:

Error: no schema with key or ref "http://json-schema.org/draft-04/schema#"

Can't understand what its complaint is.  That URL will load a JSON file so its valid.  I don't like the idea that my deployment is now dependent on an external URL!  Is there a way to turn off what ever its doing at this point; or use a local schema?

thanks
Jab

PS
The full error stack is:

     [exec]     if (!v) throw new Error('no schema with key or ref "' + schemaKeyRef + '"');
     [exec]             ^
     [exec]
     [exec] Error: no schema with key or ref "http://json-schema.org/draft-04/schema#"
     [exec]     at Ajv.validate (<my home directory>/node_modules/ajv/lib/ajv.js:94:19)
     [exec]     at Ajv.validateSchema (<my home directory>/node_modules/ajv/lib/ajv.js:178:22)
     [exec]     at Ajv._addSchema (<my home directory>/node_modules/ajv/lib/ajv.js:310:10)
     [exec]     at Ajv.validate (<my home directory>/node_modules/ajv/lib/ajv.js:96:26)
     [exec]     at validate (<my home directory>/node_modules/extract-text-webpack-plugin/schema/validator.js:8:20)
     [exec]     at Function.ExtractTextPlugin.extract (<my home directory>/node_modules/extract-text-webpack-plugin/index.js:204:3)
     [exec]     at Object.<anonymous> (<my build directory>/webpack-helper.k4LeH754/webpack.config.js:40:33)
     [exec]     at Module._compile (module.js:570:32)
     [exec]     at Object.Module._extensions..js (module.js:579:10)
     [exec]     at Module.load (module.js:487:32)
