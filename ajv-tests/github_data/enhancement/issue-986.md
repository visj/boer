# [986] custom keyword: run before format keyword

Using ajv 6.10.0,

i try to add a custom keyword that forces coercion of date/time/date-time string formats using the javascript date parser like this:
"2018-01-20T11:20:00.000" -> coerce -> "2018-01-20"
(note that the missing Z is voluntarily not a problem in that example).

I want that keyword to be somewhat "optional", meaning it can be added/removed and only coercion is lost:
```
// with date formats coercion
{ type: 'string', format: 'date', coerce: true }
// without
{ type: 'string', format: 'date' }
```

However, since `addKeyword` pushes a rule to `ajv.RULES.types.string.rules`, after the `format` string rule:
```
ajv.addKeyword('coerce', {
	modifying: true,
	type: 'string',
	validate: function(schema, data, parentSchema, path, parent, name) {
		if (data == null) return true;
		var format = parentSchema.format;
		if (format != "date" && format != "time" && format != "date-time") return true;
		var d = new Date(data);
		if (isNaN(d.getTime())) {
			parent[name] = null;
		} else {
			data = d.toISOString();
			if (format == "date") parent[name] = data.split('T').shift();
			else if (format == "time") parent[name] = data.split('T').pop();
			else if (format == "date-time") parent[name] = data;
		}
		return true;
	}
});
```
cannot work on a somewhat badly formatted but parsable date string - the format validation throws before the custom keyword has a chance to fix it.

I have to work around this by adding just after:
```
var rules = ajv.RULES.types.string.rules;
rules.unshift(rules.pop());
```

It would be nice if either
- the internals of this where "public api"
- or if there was a way to add a keyword before the "bundled" ones.
