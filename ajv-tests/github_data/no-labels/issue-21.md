# [21] how to use in browser

I am writing test cases using Jasmine and need to use ajv through my browser.

I have already attempted to use it with browserify but it doesn't seem to work. Please provide a quick example as to how to use it within browser after bundling the package using browserify.

Here is what I have done so far:

```
browserify node_modules/ajv/lib/ajv.js -o node_modules/ajv/lib/bundle.js
```

and added that into my jasmine Spec file using:

```
  <script src="../../node_modules/ajv/lib/bundle.js"></script>
```

Then??
