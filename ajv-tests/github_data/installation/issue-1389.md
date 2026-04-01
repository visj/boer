# [1389] Error after upgrade due to yarn.lock

**The version of Ajv you are using**

problems while upgrading from 7.0.2 to 7.0.3.

**The environment you have the problem with**

Seems somehow related to the release of the new version of ajv but without any clear hint. After the upgrade from 7.0.2 to 7.0.3 the problem occurred (again, as already did with previous upgrades) until I deleted the yarn.lock file
This is a followup of issue #1363.

**Your code (please make it as small as possible to reproduce the issue)**

I attached the two yarn.lock files before the upgrade (not working with 7.0.3 and labelled as "bad") and after the upgrade (freshly created after deleted the original lock file, labelled as "good"). In other words the yarn.lock file created with 7.0.2 prevent the application to work with 7.0.3

**Results and error messages in your platform**

The error raised is:

`Cannot read property 'test' of undefined`

 I report here the main context description from the other issue (#1363):

1) my local deployment is working fine
2) on 2nd of January in the morning I pushed a commit and the test workflow on Github actions completed with success
3) the cron job on github action executed the 3rd of January in the early morning and failed with the same error reported in this issue (the cron executed the tests on the exact same commit that succeeded the day before, so the problem was not directly due to my code)
4) after that any other commit, cron or manual execution on github actions failed in the same way
5) my local deployment continued to work (also by executing the same karma job that was failing on github actions)
6) I created a fresh local deployment and this started to fail

The difference between (5) and (6) was the content of node_modules (some differences in versions of some sub-dependencies). I verified that to the content of the yarn.lock files was different and this can explain why my original local deployment was continuing to work, probably It was ignoring some new version of some sub-dependency)



[yarn.lock.bad.zip](https://github.com/ajv-validator/ajv/files/5807188/yarn.lock.bad.zip)
[yarn.lock.good.zip](https://github.com/ajv-validator/ajv/files/5807191/yarn.lock.good.zip)
