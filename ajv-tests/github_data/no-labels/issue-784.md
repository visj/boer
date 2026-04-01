# [784] Assign default value when field type is invalid

Hi,

I'm trying to find the way to assign a default value when a field type is invalid.

var schema = {
  'type': 'object',
  'properties': {
		'foo': { 'type': 'string', 'default': '' },
		'zoo': { 'type': number, 'default': 0 }
  },
}

var data = { 'foo': 'test', 'zoo': 'test'}

var av = new Avj({ useDefaults: true });
var validate = av.compile(schema);
console.log(validate(data));  // false
console.log(data);  //  { 'foo': 'test', 'zoo': 'test'}

I want the result to be {'foo': 'test', 'zoo': 0}
the useDefaults: true option only works when the field is not there.

thanks,