# [526] Rename lib/$data.js and lib/refs/$data.json without the "$"

Using ajv-5.1.5

We use ajv as a dependency to webpack in the development of single page web applications. Our corporate build servers are configured (by design) to not be able to access Internet resources, including npmjs.com. Since we do not have an internal npm server, we are forced to check-in our dependencies so our build servers can build our web sites. The issue here is that ajx had two files that cannot be checked into TFS -  $data.js and $data.json. This is the first such issue we've encountered in a nodejs type library.

In order to maintain compatibility with the TFS system that is still popular in corporate environments, it would be helpful to rename the $data.* files to simply data.* to allow them to be checked in to TFS. TFS restricts filenames from including the following characters - "/ \ [ ] : | < > + = ; ? * https://www.visualstudio.com/en-us/docs/reference/naming-restrictions

I would create a pull request with a fix; however unfortunately I am forbidden by my employer from contributing to such projects.

