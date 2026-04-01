# [2132] Typescipt and ESM yields "Ajv This expression is not constructable"

I have a TS project in ESM mode (type:module) and getting VSCode errors using certain modules such as Ajv..

Given this in my tsconfig.json:
```
{  
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "nodenext",
    "esModuleInterop": true
    // I had a lot more stuff but the top two lines are the ones causing issue (Node16 is same)
  }
}
```

package.json
```
{
  "name": "test",
  "type": "module",
  "dependencies": {
    "ajv": "^8.11.0"
  },

  "devDependencies": {
    "@tsconfig/node16": "^1.0.3",
    "@types/node": "^18.11.0",
    "typescript": "^4.8.3"
  }
}
```
and finally code:
```
import Ajv from "ajv"
export const getClient = ():Ajv => { 
  return  new Ajv()
}
```
I get the error as attached
<img width="856" alt="Screen Shot 2022-10-15 at 9 58 18 PM" src="https://user-images.githubusercontent.com/777498/196018875-a50b596c-330e-43d7-8ae9-61ba9fdc89bf.png">

Note that this code compiles correctly.

If I do:
```
import  Ajv from "ajv"
export const getClient = ():Ajv.default => { 
  return  new Ajv.default()
}
```
Then error goes away but it does not run.

I think this is something to do with CJS modules needing to add something for esm export but not sure exactly what. 

Here's a [sandbox](https://codesandbox.io/p/github/cyberwombat/ts-esm-test/draft/kind-sea?file=%2Findex.ts&workspace=%257B%2522activeFileId%2522%253A%2522cl9bh5ug20002lrhb6woealfc%2522%252C%2522openFiles%2522%253A%255B%255D%252C%2522sidebarPanel%2522%253A%2522EXPLORER%2522%252C%2522gitSidebarPanel%2522%253A%2522COMMIT%2522%252C%2522sidekickItems%2522%253A%255B%257B%2522type%2522%253A%2522TERMINAL%2522%252C%2522shellId%2522%253A%2522cl9bh6bqv000blrhb74jv6h3z%2522%252C%2522key%2522%253A%2522cl9bh6b2o00523b6fhlt7a3mv%2522%252C%2522isMinimized%2522%253Afalse%257D%255D%257D) 
