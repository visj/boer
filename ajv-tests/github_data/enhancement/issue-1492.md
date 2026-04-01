# [1492] I want to be able to use errorsText and similar helpers without the need of creating ajv instance

I want to be able to use errorsText and similar helpers without the need of creating ajv instance.

Right now if you want to use errorsText you need to create ajv instance

`
  return new ajv().errorsText(errors, options);
`
this is happening now because in errorsText implementation we have `errors || this.errors`.

it would be better if you can export errorsText directly and have wrapper under ajv instance.
`
function errorsText(errors, options) {
  exportedVersionofErrorsText(errors || this.errors,options);
}
`

I think this related to #1359

**What version of Ajv you are you using?**
7.2.1

**What problem do you want to solve?**
API, this will allow utills methods for Ajv as we abstract the use of ajv with in our project.

**Will you be able to implement it?**
why not :) if you guys agree