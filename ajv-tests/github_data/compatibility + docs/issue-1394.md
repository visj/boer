# [1394] Make package.json scripts compatible with windows.

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/docs/faq.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for compatibility issues.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**The version of Ajv you are using**

7.0.3
Building from source.

**The environment you have the problem with**

Microsoft Windows 10 - Powershell.

**Your code (please make it as small as possible to reproduce the issue)**

npm install

**Results and error messages in your platform**

It runs the prepublish hook, which triggers the build script which seems to be written for unix-like environments (Mac and Linux). The windows command line does not understand "rm -rf" command. I could try to use the windows subsystem for linux but it would be easier to have cross-platform scripts. 

Such a change would make **ajv** more welcoming to new contributors. 

Two solutions : 

- We use cross-platforms apis, for example the Node fs module.
- We maintain two separate set of scripts for both unix and windows command lines.



