# [757] "useDefaults: true" not working in electronjs

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.4.0

**Ajv options object**
useDefaults: true

The code in the script of index.html is sourced from https://github.com/epoberezkin/ajv#assigning-defaults. Please see the **EXPECTED** and **OBSERVED** code comments.

Reproducible with the structure detailed below. Once these files are in place, follow the electronjs tutorial (https://electronjs.org/docs/tutorial/first-app), performing the following commands:
> npm install --save-dev electron
> npm start

**Structure**
* index.html
* main.js
* package.json

**index.html**
```html
<!DOCTYPE html>
<html>
  <body>
    <!-- 
      "We are using node 8.2.1, Chrome 59.0.3071.115, and Electron 1.8.4."
    -->
    We are using node <script>document.write(process.versions.node)</script>,
    Chrome <script>document.write(process.versions.chrome)</script>,
    and Electron <script>document.write(process.versions.electron)</script>.
    <script>
      const remote = require('electron').remote;
      const Ajv = remote.require('ajv');
      var ajv = new Ajv({ useDefaults: true });
      var schema = {
        "type": "object",
        "properties": {
          "foo": { "type": "number" },
          "bar": { "type": "string", "default": "baz" }
        },
        "required": [ "foo", "bar" ]
      };
      var data = { "foo": 1 };
      var validate = ajv.compile(schema);
      console.log(validate(data)); // true
      // EXPECTED: { "foo": 1, "bar": "baz" }
      // OBSERVED: { "foo": 1 }
      console.log(data);
    </script>
  </body>
</html>
```

**main.js**
```javascript
const {app, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')
let win
function createWindow () {
  win = new BrowserWindow({width: 800, height: 600})
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
  win.webContents.openDevTools()
}
app.on('ready', createWindow)
app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})
```

**package.json**
```json
{
  "name": "demo",
  "version": "0.1.0",
  "main": "main.js",
  "dependencies": {
    "ajv": "*"
  },
  "scripts": {
      "start": "electron ."
  }
}
```

**What results did you expect?**
Expected that "useDefaults: true" works in an electronjs context, as it does in raw nodejs.
