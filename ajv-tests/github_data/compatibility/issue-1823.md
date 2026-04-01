# [1823] Dynamic module import not working

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
/8.6.1/ajv2019

**JSON Schema**
Don't get to the point where a schema could be loaded ..

**Sample data**
Don't get to the point where data could be checked with the schema ..

**Your code**
```javascript
<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="content-type" content="text/html; charset=utf-8" />
	<meta http-equiv="expires" content="0" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body>
<div><h3>Dynamic Module Import</h3></div>

	<script type="module">
		
		import('https://specif.de/check.js').then( mod => {
			console.debug('mod: ',mod);
			console.info('7x3=',mod.multiply(7,3));
		});

		import('https://cdnjs.cloudflare.com/ajax/libs/ajv/8.6.1/ajv2019.min.js').then( mod => {
			console.debug('mod: ',mod);
		});

	</script>
</body>
</html>
```

**Validation result, data AFTER validation, error messages**
Chrome Console:
- First module is loaded and can be used
- Second module (ajv2019) creates an error
![grafik](https://user-images.githubusercontent.com/8947971/142674597-06d98153-3501-446d-994b-a7ec599e04c3.png)

**What results did you expect?**
ajv module is dynamically loaded and can be used.

**Are you going to resolve the issue?**
We wouldn't know how ...

Thanks a lot!  We have been using /4.11.8/ajv for quite a while and are very pleased with it!
- https://specif.de/apps/edit.html

Best regards, 
The Specif-Viewer Team
