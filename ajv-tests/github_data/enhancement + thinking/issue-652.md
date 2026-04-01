# [652] Validation of multipleOf keyword with decimal numbers

Due to the rounding issues (IEEE-754) with computations using decimal numbers in several languages including JavaScript, the validation of fields using the "multipleOf" or "divisibleBy" properties will often erroneously fail validation.  

As an example, using a field with the "multipleOf" property set to 0.015, the validation will fail when the field is set to valid values such as 0.135, 0.165, 0.195, 0.225, etc.  All of said values are divisible by 0.015.

This can be remedied by changing the algorithm used to validate the "multipleOf" and "divisibleBy" properties.  The change involves scaling both the field and "multipleOf" values to integer equivalents and then performing the required validation on those values.  Below is some code that I had written for another JSON validator which had the same issue.  

```javascript

//The following uses string parsing to determine the number of
//decimal places for a given number.  String parsing is used 
//because any arithmetic method used to determine decimal
//point precision is still subject to the rounding errors within
//JavaScript.  This algorithm handles numbers using exponential
//notation as well.
getDecimalPlaces = function getDecimalPlaces(number) {

    let decimalPlaces = 0;
    if (isNaN(number)) return decimalPlaces;

    if (typeof number !== 'number') {
        number = Number(number);
    }
    
    const parts = number.toString().split('e');
    if (parts.length === 2) {
        if (parts[1][0] !== '-') {
            return decimalPlaces;
        } else {
            decimalPlaces = Number(parts[1].slice(1));
        }
    }

    const decimalParts = parts[0].split('.');
    if (decimalParts.length === 2) {
        decimalPlaces += decimalParts[1].length;
    }

    return decimalPlaces;
}

//The getDecimalPlaces function above can then be used in the 
//validation process to scale the two values out to equivalent
//integer values. The integer values, which are not subject to the
//rounding errors, are then used to perform the validation.

const fieldDecimals = getDecimalPlaces(fieldValue);
const multipleOfDecimals = getDecimalPlaces(multipleOfValue);

//Ensure the values will be the same precision
const maxDecimals = Math.max(fieldDecimals , multipleOfDecimals);
const multiplier = Math.pow(10, maxDecimals);

//Convert values to integers using multiplier above and check 
//modulus for validity
if (Math.round(fieldValue * multiplier) % Math.round(multipleOfValue * multiplier) !== 0) {
    //NOT VALID
}
 

```

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
5.5.2

**Are you going to resolve the issue?**
Unfortunately, I do not have time to resolve the issue on my own...
