# [335] Pass data path, parent data and property name to format validation function

**What version of Ajv you are you using?**
4.8.2

**What problem do you want to solve?**
Modifying/re-formatting the validated value. 
Users input all kinds of values and you wouldn't make it hard for them, just to get a well-formatted value. You should clean/modify the input if it can be validated. 
 - For example, you can accept a phone number with spaces and some limited punctuation chars but after you validate the value, you'd remove all non-numeric chars and insert the value in db. 
 - Another real-life example, sometimes users input their names, all lower-cased. It is still valid data   but just not in proper format. You could re-format it to title-case with this feature.

**What do you think is the correct solution to problem?**
We could have an additional feature under [Options to modify validated data](https://github.com/epoberezkin/ajv#options-to-modify-validated-data) — `reformat:Object` option.
```js
let ajvOptions = {
    ...
    useDefaults: true,
    formats: {
        "phone": function (value) {
            return /^[\d\-\(\)\+ ]{11,}$/.test(value); // e.g. +90 (212) 555-1112233
        }
    },
    reformat: {
        "phone": function (value) {
            return value.replace(/[^\d]/g, ''); // e.g. 902125551112233
        }
    },
    ...
};
```

**Will you be able to implement it?**
Not currently.
