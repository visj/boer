# [630] $data files ignored by TFS

We are using TFS as version control system (company policy), and we have to check in node_modules (company policy), and TFS refuses to handle files starting with a dollar sign ($).

This is clearly not a ajv bug but a TFS limitation but it can easily be circumvented from ajv.

Any change that $data.js and $data.json could be renamed?