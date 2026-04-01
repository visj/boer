# [1637] if.js is not being created on install

After installing using yarn on both the latest version and on 6.12.6 on a windows system with Yarn and Symfony webpack encore 

I have found the node_modules\ajv\lib\dotjs\if.js is not being created, this was working prior to yesterday as older projects have it, but projects updated since and even a fresh install with default settings is returning the error. 

I verified that even in a stand alone directory it didn't install the if.js file and I do not see it in the repository, its been tried on multiple laptops with the same results 

Yarn return -  [webpack-cli] Error: Cannot find module './if'

is this a bug, has the fine been moved, or is it something on my end