# [2266] Default errror message is displayed even when custom error message is provided.

Hi,

Im validating whether the property name provided matches the pattern that i have provided and., if it doesnt match, i have provided a custom error message, so that default message is overridden by custom message. 
But the issue is that along with the custom message even the default message is displayed which is not what i expected.

_Please click the below link to check the issue mentioned above._
https://codesandbox.io/s/sweet-taussig-q8ubk6

_Steps:_ 
In codepen, click the button that is available on top of angular logo, and check in its console.

**_Versions:_**
"ajv": "^8.12.0",
"ajv-errors": "^3.0.0",
 "ajv-keywords": "^5.1.0",