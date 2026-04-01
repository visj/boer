# [2530] Firefox: Select with over 250 options - InternalError: function nested too deeply

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
I use Ajv Version 8.17.1 and the issue still happens

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
const ajv = new Ajv({ strict: false });
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
	"$schema": "http://json-schema.org/draft-07/schema#",
	"type": "object",
	"properties": {
		"select_string_type": {
			"type": "string",
			"oneOf": [
				{
					"const": "test_1",
					"title": "test_1"
				},
				{
					"const": "test_2",
					"title": "test_2"
				},{
					"const": "test_3",
					"title": "test_3"
				},{
					"const": "test_4",
					"title": "test_4"
				},{
					"const": "test_5",
					"title": "test_5"
				},
                                ...
                                {
					"const": "test_294",
					"title": "test_294"
				},{
					"const": "test_295",
					"title": "test_295"
				},{
					"const": "test_296",
					"title": "test_296"
				},{
					"const": "test_297",
					"title": "test_297"
				},{
					"const": "test_298",
					"title": "test_298"
				},{
					"const": "test_299",
					"title": "test_299"
				},{
					"const": "test_300",
					"title": "test_300"
				}
			],
			"title": "__(SELECT_STRING)",
			"x-jsf-presentation": {
				"inputType": "select"
			}
		},
		"select_number_type": {
			"type": "number",
			"oneOf": [
				{
					"const": 0,
					"title": "one"
				},
				{
					"const": 1,
					"title": "two"
				}
			],
			"title": "__(SELECT_NUMBER)",
			"x-jsf-presentation": {
				"inputType": "select"
			}
		},
		"string_type": {
			"type": "string",
			"title": "__(STRING)",
			"maxLength": 64,
			"x-jsf-presentation": {
				"inputType": "text"
			}
		}
	},
	"allOf": [
		{
			"if": {
				"properties": {
					"select_number_type": {
						"const": 0
					}
				}
			},
			"then": {
				"properties": {
					"string_type": {
						"minLength": 1,
						"maxLength": 64
					}
				},
				"required": [
					"string_type"
				]
			},
			"else": {
				"properties": {
					"string_type": {
						"x-jsf-presentation": {
							"inputType": "hidden"
						}
					}
				}
			}
		}
	],
	"required": [
		"select_string_type",
		"select_number_type"
	]
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
 {
    "select_string_type": "test_1",
    "select_number_type": 0,
    "string_type": "string example"
  }

```

**Your code**

<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://ajv.js.org/guide/getting-started.html
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
<script setup>
import { ref } from "vue";
import Ajv from "ajv";
import schema from "./../assets/schema/schema.json?raw";

const elements_select_string = ref([
  "test_1",
  "test_2",
  "test_3",
  "test_4",
  ...
  "test_297",
  "test_298",
  "test_299",
  "test_300",
]);

const selectStringElement = ref("");
const selectNumberElement = ref(0);
const stringElement = ref("string example");

async function createJSON() {
  let config = {
    jsonFile: {
      version: "0.1.0",
      form: {
        select_string_type: selectStringElement.value,
        select_number_type: selectNumberElement.value,
        string_type: stringElement.value,
      },
    },
  };

  await validateJSON(config);
}

async function validateJSON(config) {
  const ajv = new Ajv({ strict: false });

  try {
    const validate = ajv.compile(JSON.parse(schema));
    const valid = validate(config.jsonFile.form);

    if (valid) {
      console.log("JSON valid");
    } else {
      console.log("JSON invalid", validate.errors);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
</script>

<template>
  <div>
    <h1>Example</h1>
    <form>
      <label for="select_string_type">Choose Select String Type:</label>
      <select v-model="selectStringElement" id="select_string_type">
        <option
          v-for="select in elements_select_string"
          :key="select"
          :value="select"
        >
          {{ select }}
        </option>
      </select>
      <br />

      <label for="select_number_type">Choose Select Number Type:</label>
      <select v-model="selectNumberElement" id="select_number_type">
        <option value="0">one</option>
        <option value="1">two</option>
      </select>
      <br />

      <label for="string_type">String Type: </label>
      <input
        v-model="stringElement"
        id="string_type"
        name="string_type"
        type="text"
      />
      <br />

      <input
        type="button"
        name="submit_form"
        id="submit_form"
        value="Submit Form"
        @click="createJSON"
      />
    </form>
  </div>
</template>

```

**Validation result, data AFTER validation, error messages**

```
Error: InternalError: function nested too deeply
    validateJSON HelloWorld.vue:333
    createJSON HelloWorld.vue:325
    callWithErrorHandling runtime-core.esm-bundler.js:199
    callWithAsyncErrorHandling runtime-core.esm-bundler.js:206
    invoker runtime-dom.esm-bundler.js:729
    addEventListener runtime-dom.esm-bundler.js:680
    patchEvent runtime-dom.esm-bundler.js:698
    patchProp runtime-dom.esm-bundler.js:775
    mountElement runtime-core.esm-bundler.js:4873
    processElement runtime-core.esm-bundler.js:4820
    patch runtime-core.esm-bundler.js:4688
    mountChildren runtime-core.esm-bundler.js:4932
    mountElement runtime-core.esm-bundler.js:4855
    processElement runtime-core.esm-bundler.js:4820
    patch runtime-core.esm-bundler.js:4688
    mountChildren runtime-core.esm-bundler.js:4932
    mountElement runtime-core.esm-bundler.js:4855
    processElement runtime-core.esm-bundler.js:4820
    patch runtime-core.esm-bundler.js:4688
    componentUpdateFn runtime-core.esm-bundler.js:5326
    run reactivity.esm-bundler.js:225
    setupRenderEffect runtime-core.esm-bundler.js:5454
    mountComponent runtime-core.esm-bundler.js:5229
    processComponent runtime-core.esm-bundler.js:5182
    patch runtime-core.esm-bundler.js:4700
    componentUpdateFn runtime-core.esm-bundler.js:5326
    run reactivity.esm-bundler.js:225
    setupRenderEffect runtime-core.esm-bundler.js:5454
    mountComponent runtime-core.esm-bundler.js:5229
    processComponent runtime-core.esm-bundler.js:5182
    patch runtime-core.esm-bundler.js:4700
    render2 runtime-core.esm-bundler.js:5979
    mount runtime-core.esm-bundler.js:3941
    mount runtime-dom.esm-bundler.js:1767
    <anonymous> main.js:11
HelloWorld.vue:341:12

```

**What results did you expect?**
When using Chrome, the validation works without any problems. When using Firefox, this issue occurs without any changes made. I tried different approaches with the parameters, but nothing seems to work. As soon as there are more than 250 options, this error occurs.

This issue is happening when using AJV in a Vue.js project with Composition API.

I've added the Vue project below. You can unpack it and run ```npm run dev``` in the folder where the entire project is located.

[ajv_error.zip](https://github.com/user-attachments/files/18573986/ajv_error.zip)