# [1184] when judge error instanceof ValidationError, expect true, but is false

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
ajv 6.12.0

我正在使用 egg-ajv 做格式校验，使用的 typescript 而不是 javascript，在 controller 中编写以下代码：
```javascript
import { ValidationError } from 'ajv';

try {
      await this.ctx.validate('schema.pagination', this.ctx.request.query);
    } catch (error) {
      console.log('error ---> ', error instanceof ValidationError);
    }
```
console.log 期望得到 true ，但是缺得到了 false。使用 JavaScript 没问题，但是在 typescript 中判断的是错误的，请问这是什么问题呢？