# [320] Missing dist folder for releases

For all releases, the dist folder is missing.

Take a look at how jQuery manages releases for example: https://github.com/jquery/jquery/commit/ee2e377494a882f043e6d8abc67ac6370ee83d9c

They fork off a branch, tag it, and commit the built files.

The reasoning for this is so that people can pull the package in via bower. Currently bower.json points to dist/ajv.min.js, but that file doesn't actually exist when pulling the package in using bower.
