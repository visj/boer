# [48] Array indices in dataPath of error messages are in quotes

Everything is working great, I'm just wondering what's the best way to make the errors easier to track down and fix in the data object.

For example, I get an error that looks like this:

``` javascript
{ keyword: "required",
  dataPath: ".assetGroups['166'].previewUrl",
  message: "should have required property .previewUrl" }
```

Tracking down assetGroup object 166 in an array of 200 of them, is not that easy. Maybe if I used some sort of a good JSON editor it would help. However, would it be possible to instead of showing number 166 perhaps use another property that is available on that assetGroup.

So let's say that my assetGroup object 166 looks like this:

``` javascript
{ id: "cats" }
```

Could the error message look more like 

``` javascript
{ keyword: "required",
  dataPath: ".assetGroups['166'].previewUrl",
  prettyDataPath: "assetGroups[cats].previewUrl",
  message: "should have required property .previewUrl" }
```

It would make it a lot easier for me to find the object if I search for "cats".

Or maybe there could be a way to use the dataPath to programatically work backwords in the data to get the full objects that relate to the error?

Any suggestions are welcome :)
