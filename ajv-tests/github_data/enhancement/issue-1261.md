# [1261] Remove bundled builds from NPM package

**AJV version?**

6.12.3

**What problem do you want to solve?**

Minified & webpacked builds should not be included in the NPM package `ajv` - They are unnecessary and create major security risks for downstream package consumers.

For a more thorough explanation, please see [Sven Slootweg's gist on the subject](https://gist.github.com/joepie91/04cc8329df231ea3e262dffe3d41f848) 

**What do you think is the correct solution to problem?**

Remove the `dist` folder from the `files` array in `package.json`. 

The webpacked bundles are probably still useful to certain developers. To make them available, i suggest two alternatives:
1. Publish the webpacked builds on a CDN host like `cdnjs.com`
2. Upload the webpacked builds as resources on each new git tag. ([can be automated](https://github.com/actions/upload-release-asset))

**Will you be able to implement it?**

Yes, to different extents depending on which option is chosen.
