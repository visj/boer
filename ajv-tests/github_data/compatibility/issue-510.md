# [510] AJV with typescript problem

I'm using "ajv": "^5.1.5" with webpack and typescript but i'm getting  several errors related with ajv's dependencies.  

import * as AJV from 'ajv';

ERROR in ./\~/ajv/lib/ajv.js
Module not found: Error: Can't resolve './compile/resolve' in '/home/javier/projects/dbdash-app/node_modules/ajv/lib'
 @ ./~/ajv/lib/ajv.js 4:14-42
 @ ./src/libs/validator.ts
 @ ./src/components/app/app-login/index.ts
 @ ./src/index.ts

ERROR in ./\~/ajv/lib/ajv.js
Module not found: Error: Can't resolve './cache' in '/home/javier/projects/dbdash-app/node_modules/ajv/lib'
 @ ./~/ajv/lib/ajv.js 5:12-30
 @ ./src/libs/validator.ts
 @ ./src/components/app/app-login/index.ts
 @ ./src/index.ts

ERROR in ./\~/ajv/lib/ajv.js
Module not found: Error: Can't resolve './compile/schema_obj' in '/home/javier/projects/dbdash-app/node_modules/ajv/lib'
 @ ./~/ajv/lib/ajv.js 6:19-50
 @ ./src/libs/validator.ts
 @ ./src/components/app/app-login/index.ts
 @ ./src/index.ts

ERROR in ./\~/ajv/lib/ajv.js
Module not found: Error: Can't resolve './compile/formats' in '/home/javier/projects/dbdash-app/node_modules/ajv/lib'
 @ ./~/ajv/lib/ajv.js 8:14-42
 @ ./src/libs/validator.ts
 @ ./src/components/app/app-login/index.ts
 @ ./src/index.ts

ERROR in ./\~/ajv/lib/ajv.js
Module not found: Error: Can't resolve './compile/rules' in '/home/javier/projects/dbdash-app/node_modules/ajv/lib'
 @ ./~/ajv/lib/ajv.js 9:12-38
 @ ./src/libs/validator.ts
 @ ./src/components/app/app-login/index.ts
 @ ./src/index.ts

ERROR in ./\~/ajv/lib/ajv.js
Module not found: Error: Can't resolve './$data' in '/home/javier/projects/dbdash-app/node_modules/ajv/lib'
 @ ./~/ajv/lib/ajv.js 10:22-40
 @ ./src/libs/validator.ts
 @ ./src/components/app/app-login/index.ts
 @ ./src/index.ts

ERROR in ./\~/ajv/lib/ajv.js
Module not found: Error: Can't resolve './patternGroups' in '/home/javier/projects/dbdash-app/node_modules/ajv/lib'
 @ ./~/ajv/lib/ajv.js 11:20-46
 @ ./src/libs/validator.ts
 @ ./src/components/app/app-login/index.ts
 @ ./src/index.ts

ERROR in ./\~/ajv/lib/ajv.js
Module not found: Error: Can't resolve './compile/util' in '/home/javier/projects/dbdash-app/node_modules/ajv/lib'
 @ ./~/ajv/lib/ajv.js 12:11-36
 @ ./src/libs/validator.ts
 @ ./src/components/app/app-login/index.ts
 @ ./src/index.ts

ERROR in ./\~/ajv/lib/ajv.js
Module not found: Error: Can't resolve './compile/async' in '/home/javier/projects/dbdash-app/node_modules/ajv/lib'
 @ ./~/ajv/lib/ajv.js 30:29-55
 @ ./src/libs/validator.ts
 @ ./src/components/app/app-login/index.ts
 @ ./src/index.ts

ERROR in ./\~/ajv/lib/ajv.js
Module not found: Error: Can't resolve './keyword' in '/home/javier/projects/dbdash-app/node_modules/ajv/lib'
 @ ./~/ajv/lib/ajv.js 31:20-40
 @ ./src/libs/validator.ts
 @ ./src/components/app/app-login/index.ts
 @ ./src/index.ts

ERROR in ./\~/ajv/lib/ajv.js
Module not found: Error: Can't resolve './compile/error_classes' in '/home/javier/projects/dbdash-app/node_modules/ajv/lib'
 @ ./~/ajv/lib/ajv.js 36:19-53
 @ ./src/libs/validator.ts
 @ ./src/components/app/app-login/index.ts
 @ ./src/index.ts

ERROR in ./\~/ajv/lib/ajv.js
Module not found: Error: Can't resolve './compile' in '/home/javier/projects/dbdash-app/node_modules/ajv/lib'
 @ ./\~/ajv/lib/ajv.js 3:20-40
 @ ./src/libs/validator.ts
 @ ./src/components/app/app-login/index.ts
 @ ./src/index.ts

ERROR in ./\~/ajv/lib/ajv.js
Module not found: Error: Can't resolve 'co' in '/home/javier/projects/dbdash-app/node_modules/ajv/lib'
 @ ./\~/ajv/lib/ajv.js 13:9-22
 @ ./src/libs/validator.ts
 @ ./src/components/app/app-login/index.ts
 @ ./src/index.ts

ERROR in ./\~/jsonify/index.js
Module not found: Error: Can't resolve './lib/parse' in '/home/javier/projects/dbdash-app/node_modules/jsonify'
 @ ./\~/jsonify/index.js 1:16-38
 @ ./\~/json-stable-stringify/index.js
 @ ./\~/ajv/lib/ajv.js
 @ ./src/libs/validator.ts
 @ ./src/components/app/app-login/index.ts
 @ ./src/index.ts

ERROR in ./\~/jsonify/index.js
Module not found: Error: Can't resolve './lib/stringify' in '/home/javier/projects/dbdash-app/node_modules/jsonify'
 @ ./\~/jsonify/index.js 2:20-46
 @ ./\~/json-stable-stringify/index.js
 @ ./\~/ajv/lib/ajv.js
 @ ./src/libs/validator.ts
 @ ./src/components/app/app-login/index.ts
 @ ./src/index.ts