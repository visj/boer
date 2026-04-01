# [519] Generate more human friendly error messages using *label* field instead of property key

**What version of Ajv you are you using?**
5.1.5

**What problem do you want to solve?**
* generally, we will be using `developer-friendly` words like `fromMail` or `from_mail` as key.
* While generating errors, instead of using above said internal key, if we use a more human readable  `label`, we can generate better error messages with less effort.
For Eg:
```
{
fromMail:{
  type: 'string',
  label: 'From email address',
  format: 'email'
}
```
will produce a message like 
`From email address should be in a valid email format `
instead of 
`fromMail should be in a valid email format `

**What do you think is the correct solution to problem?**
Yes.
**Will you be able to implement it?**
Sure. I can try . But before that, I would like to discuss this Idea here
