# [1197] Can use in global function that will be run concurrently by billons?

I just want know, if i create schema with Ajv.addSchema(), compile, and put it on a global object lik, global.MySchemas['TheSchemaName'], with global.MySchemas['TheSchemaName'] = Ajv.getSchema(); We can assume that we save more memory usage, than using Ajv.getSchema(); everytime that we will use it? So, we can believe that global.MySchemas['TheSchemaName'] will be used lot concurrently, so...
function validateMiddleware(){
var validate = global.MySchemas['TheSchemaName']; 
var valid =  validate(JsonBody);
if(valid){
//All valid, do that stuff
}else{
//Work with errors
validate.errors;
}
}
The above code results never will be affected by the anotther execuction concurrently of the same global.MySchemas['TheSchemaName'] ?

Sorry for any mistakes, i'm new in Github and new with Ajv.