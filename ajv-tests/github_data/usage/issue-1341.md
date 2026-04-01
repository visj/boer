# [1341] Error while referencing same file.

I am trying to validate schema of Api response, but schema contains reference to the same file and when I try to reference the same file it gives errors. I am using ajv version 6.12.6. I am using cypress tool to trigger apis and validate their schemas. Everything is written in javascript.

Following is the error for referencing same file.
<img width="619" alt="Screenshot 2020-12-07 at 3 13 45 PM" src="https://user-images.githubusercontent.com/73834788/101338535-ec935980-389e-11eb-88ab-b2e60480420e.png">

Code for the validating schema is...
<img width="1032" alt="Screenshot 2020-12-07 at 3 40 20 PM" src="https://user-images.githubusercontent.com/73834788/101341251-9e805500-38a2-11eb-9cdb-20b8759eb781.png">

Json Schema for api response...
<img width="413" alt="Screenshot 2020-12-07 at 3 42 21 PM" src="https://user-images.githubusercontent.com/73834788/101341419-e0110000-38a2-11eb-91af-2a57c38509e9.png">