# [264] 【BUG】removeAdditional will remove the valid properties

The json schema:

``` js
{"type":"object","required":["idCounter"],"properties":{"LAYJSON_VERSION":{"type":["number"],"default":""},"idCounter":{"type":["number"]},"hotareas":{"type":"array","default":[],"items":{"type":"object","required":["DATAREF_ID"],"properties":{"title":{"type":["string"],"default":"热区"},"type":{"type":"string","default":"hotarea","enum":["hotarea"]},"attr":{"type":"object","default":{},"properties":{"isNewWindow":{"type":["boolean"],"default":false},"href":{"type":["string"],"default":""},"itemPic":{"type":["string"],"default":""},"itemId":{"type":["number","string"],"default":""},"itemTitle":{"type":["string"],"default":""}}},"style":{"type":"object","default":{},"properties":{"left":{"type":["number"],"default":0},"top":{"type":["number"],"default":0},"width":{"type":["number"],"default":300},"height":{"type":["number"],"default":150}}},"DATAREF_ID":{"type":["number"]},"info":{"type":"object","default":{}}}}},"components":{"type":"array","default":[],"items":{"type":"object","required":["DATAREF_ID"],"properties":{"_id":{"type":["number","null"]},"_setting":{"oneOf":[{"type":"object","properties":{"TagId":{"type":["number"],"default":null}}},{"type":"null"}]},"title":{"type":["string"],"default":"新建模块"},"description":{"type":["string","null"],"default":null},"type":{"type":"string","default":"component","enum":["component"]},"style":{"type":"object","default":{},"properties":{"z-index":{"type":"integer","default":0},"height":{"type":["number"],"default":200},"background-color":{"type":["string"],"default":"transparent"},"background-size":{"type":["string"],"default":"100% 100%"},"background-repeat":{"type":"string","default":"no-repeat","enum":["no-repeat","repeat"]}}},"show":{"type":"boolean","default":true},"attr":{"type":"object","default":{},"properties":{"bgUrl":{"type":["string","null"],"default":""}}},"widgets":{"type":"array","default":[],"items":{"oneOf":[{"type":"object","required":["DATAREF_ID"],"properties":{"type":{"type":"string","default":"widget","enum":["widget"]},"title":{"type":["string"],"default":"图片"},"widgetType":{"type":"string","default":"pic","enum":["pic"]},"attr":{"type":"object","default":{},"properties":{"bgUrl":{"type":["string","null"],"default":""}}},"style":{"type":"object","default":{},"properties":{"background-size":{"type":"string","default":"100% 100%"},"background-repeat":{"type":"string","default":"no-repeat","enum":["no-repeat","repeat"]},"z-index":{"type":"integer","default":1},"left":{"type":["number"],"default":0},"top":{"type":["number"],"default":0},"width":{"type":["number"],"default":200},"height":{"type":["number"],"default":100},"background-color":{"type":"string","default":"transparent"},"border-style":{"type":"string"},"border-width":{"type":["number"]},"border-color":{"type":"string"},"border-radius":{"type":["number"]},"transform":{"type":"string","default":"none"}}},"single":{"type":["number"],"default":0},"DATAREF_ID":{"type":["number"]},"info":{"type":"object","default":{}}}},{"type":"object","required":["DATAREF_ID"],"properties":{"type":{"type":"string","default":"widget","enum":["widget"]},"title":{"type":"string","default":"文字"},"widgetType":{"type":"string","default":"text","enum":["text"]},"attr":{"type":"object","default":{},"properties":{"text":{"type":"string","default":"双击即可修改文字"}}},"style":{"type":"object","default":{},"properties":{"color":{"type":"string","default":"#000"},"font-family":{"type":"string","default":"微软雅黑"},"font-size":{"type":["number","string"],"default":"24px"},"text-align":{"type":"string","default":"left"},"font-weight":{"type":"string","default":"normal"},"font-style":{"type":"string","default":"normal"},"line-height":{"type":["number","string"]},"text-decoration":{"type":"string","default":"none"},"z-index":{"type":"integer","default":1},"left":{"type":["number"],"default":0},"top":{"type":["number"],"default":0},"width":{"type":["number"],"default":200},"height":{"type":["number"],"default":100},"background-color":{"type":"string","default":"transparent"},"border-style":{"type":"string"},"border-width":{"type":["number"]},"border-color":{"type":"string"},"border-radius":{"type":["number"]},"transform":{"type":"string","default":"none"}}},"single":{"type":["number"],"default":0},"DATAREF_ID":{"type":["number"]},"info":{"type":"object","default":{}}}},{"type":"object","required":["DATAREF_ID"],"properties":{"type":{"type":"string","default":"widget","enum":["widget"]},"title":{"type":"string","default":"艺术字"},"widgetType":{"type":"string","default":"artword","enum":["artword"]},"attr":{"type":"object","default":{},"properties":{"text":{"type":"string","default":"请在右侧更改文字"},"retUrl":{"type":["string","null"],"default":""}}},"textStyle":{"type":"object","default":{},"properties":{"color":{"type":"string","default":"#000"},"font-family":{"type":"string","default":"微软雅黑"},"font-size":{"type":["number","string"],"default":"24px"},"text-decoration":{"type":"string","default":"none"}}},"style":{"type":"object","default":{},"properties":{"z-index":{"type":"integer","default":1},"left":{"type":["number"],"default":0},"top":{"type":["number"],"default":0},"width":{"type":["number"],"default":200},"height":{"type":["number"],"default":100},"background-color":{"type":"string","default":"transparent"},"border-style":{"type":"string"},"border-width":{"type":["number"]},"border-color":{"type":"string"},"border-radius":{"type":["number"]},"transform":{"type":"string","default":"none"}}},"single":{"type":["number"],"default":0},"DATAREF_ID":{"type":["number"]},"info":{"type":"object","default":{}}}},{"type":"object","required":["DATAREF_ID"],"properties":{"type":{"type":"string","default":"widget","enum":["widget"]},"title":{"type":"string","default":"色块"},"widgetType":{"type":"string","default":"rect","enum":["rect"]},"attr":{"type":"object","default":{}},"style":{"type":"object","default":{},"properties":{"background-color":{"type":"string","default":"green"},"z-index":{"type":"integer","default":1},"left":{"type":["number"],"default":0},"top":{"type":["number"],"default":0},"width":{"type":["number"],"default":200},"height":{"type":["number"],"default":100},"border-style":{"type":"string"},"border-width":{"type":["number"]},"border-color":{"type":"string"},"border-radius":{"type":["number"]},"transform":{"type":"string","default":"none"}}},"single":{"type":["number"],"default":0},"DATAREF_ID":{"type":["number"]},"info":{"type":"object","default":{}}}},{"type":"object","required":["DATAREF_ID"],"properties":{"type":{"type":"string","default":"widget","enum":["widget"]},"title":{"type":"string","default":"视频"},"widgetType":{"type":"string","default":"text","enum":["video"]},"attr":{"type":"object","default":{},"properties":{"flashUrl":{"type":["string","null"],"default":""}}},"style":{"type":"object","default":{},"properties":{"z-index":{"type":"integer","default":1},"left":{"type":["number"],"default":0},"top":{"type":["number"],"default":0},"width":{"type":["number"],"default":200},"height":{"type":["number"],"default":100},"background-color":{"type":"string","default":"transparent"},"border-style":{"type":"string"},"border-width":{"type":["number"]},"border-color":{"type":"string"},"border-radius":{"type":["number"]},"transform":{"type":"string","default":"none"}}},"single":{"type":["number"],"default":0},"DATAREF_ID":{"type":["number"]},"info":{"type":"object","default":{}}}}]}},"single":{"type":["number"],"default":0},"DATAREF_ID":{"type":["number"]},"info":{"type":"object","default":{}}}}}}}
```

The json value for testing:

``` js
var json = {
    "hotareas": [],
    "idCounter": '86',
    "components": [{
        "type": "component",
        "info": {},
        "single": true,
        "attr": {
            "bgUrl": ""
        },
        "style": {
            "z-index": 0,
            "height": 812,
            "background-color": "#ffffff",
            "background-size": "100% 100%",
            "background-repeat": "no-repeat"
        },
        "widgets": [{
            "type": "widget",
            "title": "艺术字",
            "widgetType": "artword",
            "info": {},
            "single": 0,
            "attr": {
                "text": "请在右侧更改文字→",
                "retUrl": "http://img.zx250.com/2016/08/05/upload_14703671332151100.png@.png"
            },
            "textStyle": {
                "color": "#1f9116",
                "font-family": "华康少女体",
                "font-size": 34,
                "text-decoration": "none"
            },
            "style": {
                "z-index": 1,
                "left": 209,
                "top": 145,
                "width": 314,
                "height": 34,
                "background-color": "",
                "border-style": "solid",
                "border-width": 0,
                "border-color": "#000",
                "border-radius": 0,
                "transform": "none"
            },
            "DATAREF_ID": 165
        }],
        "DATAREF_ID": 1,
        "show": true,
        "title": "大图",
        "description": null,
        "*name*": "BaseDataRef"
    }],
    "LAYJSON_VERSION": 1
};
```

Then validate with option `removeAdditional: 'all'`, the result json below:

``` js
{"hotareas":[],"idCounter":86,"components":[{"type":"component","info":{},"single":1,"attr":{"bgUrl":""},"style":{"z-index":0,"height":812,"background-color":"#ffffff","background-size":"100% 100%","background-repeat":"no-repeat"},"widgets":[{"type":"widget","title":"艺术字","widgetType":"artword","info":{},"single":0,"attr":{"text":"请在右侧更改文字→","retUrl":"http://img.zx250.com/2016/08/05/upload_14703671332151100.png@.png"},"style":{"z-index":1,"left":209,"top":145,"width":314,"height":34,"background-color":"","border-style":"solid","border-width":0,"border-color":"#000","border-radius":0,"transform":"none"},"DATAREF_ID":165}],"DATAREF_ID":1,"show":true,"title":"大图","description":null}],"LAYJSON_VERSION":1}
```

Let us just focus on the datapath: `components[0].widgets[0]`, when using the schema to validate the testing value, the property `textStyle` will be unproper removed. 
the right logic should be matching the scheme of `widget - artword` (which has defined the property - `textStyle`).
I guess Ajv was just trying to match the one with less properties, when matched, with option `removeAdditional: 'all'`, it will remove the extra properties (in  this situation, the valid `textStyle` was removed).

This became a big problem, made losing more users' data in production environment.
May provide a solution?
