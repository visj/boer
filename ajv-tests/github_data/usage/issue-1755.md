# [1755] Cannot use \. in a pattern - Error: schema is invalid: .../pattern should match format "regex"    

Hi Evgeny - Hope you are well. I have an issue trying to expand the definition of tildePath to allow a dot character - remember it? :-) 

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

I'm using v5 - I tried using 5.6.1 and it also failed. I couldn't figure out yet how to use the latest version yet as that was giving a different error.  [Error: Cannot find module 'ajv/lib/compile/equal']


**JSON Schema**

path:
  pattern: '^~$|^(~[a-z0-9_-]+)+$'.         <!-- this works

path:
  pattern: '^~$|^(~[a-z0-9_-\.]+)+$'.         <!-- this fails with    Error: schema is invalid: .../pattern should match format "regex"    

I also tried 
/^~$|^(~[a-z0-9_-\.]+)+$/
'^~$|^(~[a-z0-9_-\\.]+)+$'
'^~$|^(~[a-z0-9_-\\\.]+)+$'

Even just a dot causes it to fail  '^~$|^(~[a-z0-9_-.]+)+$'

Oddly this one with \.  does work      '^(~[a-z0-9_-]+)*~\.profile$'

