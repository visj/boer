# [1742] Remove the lib/ directory from the npm package


**What version of Ajv you are you using?**

8.6.2

**What problem do you want to solve?**

I think npm package might be unnecessary too big. 

**What do you think is the correct solution to problem?**

I believe including the `lib/` directory might not be needed, as it looks like the compiled code and types are in the `dist/` folder. This should save around 732KB (~30% for the package size)

**Will you be able to implement it?**

Yes