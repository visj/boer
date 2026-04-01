# [524] Document plugin convention

Given that AJV is wonderfully extensible, it's natural to bundle keywords into a NPM module and there are plenty of them out there, with a variety of very similar API's which look like one of these:

    // CREATE AN INSTANCE
    var Ajv = requrire('ajv");
    var ajv = new Ajv();

    // IMPORT THE PLUGIN MODULE
    var my_plugin = require("some-plugin-module");

    // ADD THE KEYWORDS TO THE INSTANCE
    my_plugin(ajv,{options}) 
    // OR 
    my_plugin.add_keywords(ajv,option1=a,option2=b)
    // OR 
    my_plugin({ajv,option1,option2})
    // OR 
    for(k in Object.keys(my_plugin)){
       ajv.addkeyword(my_plugin[k])
    } 
    // etc.


All the plugin's essentially do the same thing:  (1) provide an `Ajv` instance, and (2) provide some parameters (typically an object).  However inconsistency of the API's makes parameterizing the set of plugins to be included on an instance require a bit of manual coding and is difficult to offload onto a text parameter file.

For the sake of consistency across the AJV plugin ecosystem, it would be nice to have a method on Ajv instances that standardizes how plugins are added, which could be as simple as:

    function(plugin,options){
         plugin(this,options)
    }

which would be called like so:

    ajv.plugin(require("some-plugin-module"), {"my":"preferences"})

which would encourage developers to adopt a consistent API for their AJV add-in modules.

------------------------------------
Full Disclosure: having plugins that are compatible with [ajvpy](https://github.com/jdthorpe/ajvpy#plugin-modules) is part of my motivation, and this may be a trip down the rabbit hole, but here's how I load my own plugins in NodeJS:

    var semver = require("semver");
    var Ajv = require("ajv");
    var ajv = new Ajv();

    var plugin_spec = { // easily offloaded to a JSON File
        "ajv-data-table": {
            "version": "^1.0.0",
            "options": {
                "foo": "bar"
            }
        },
        "ajv-currency": {
            "version": "^3.4.5",
            "options": {
                "foo": "bar"
            }
        }
    }
    add_plugins(ajv,plugin_spec)


    function add_plugins(/* an AJV Instance */ajv,
                         /* plugin options  */plugins){
        for(key in plugins){
            if(!plugins.hasOwnProperty(key))
                continue;
            
            if(plugins[key].version){
                var version = require(key+"/package.json").version;
                if(!semver.satisfies(version, plugins[key].version))
                    throw new Error(`Installed version "${version}" of plugin "${key}" does not satisify "${plugins[key].version}"`);
            }

            if(plugins[key].options){
                require(key)(ajv,plugins[key].options)
            }else{
                require(key)(ajv)
            }
        }
             
    }

