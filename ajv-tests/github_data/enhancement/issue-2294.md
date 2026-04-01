# [2294] Support for nested/multiple discriminators in JTDSchemaType

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**

8.12.0

**What problem do you want to solve?**

I need to create a schema which can validate 3 different types based on values of 2 different fields in the input
Here is my code:
```
interface employeeEngineer {
  employeeType: "Engineer";
  jobType: "Full Time" | "Part Time";
  employeeId: string;
}

interface employeeManagerL1 {
employeeType: "Manager";
jobType: "Full Time";
managerId: string;
}

interface employeeManagerL2 {
employeeType: "Manager";
jobType: "Part Time";
managerId: string;
managerHours: number;
}

const schema: JTDSchemaType<employeeEngineer | employeeManagerL1 | employeeManagerL2>= {
  discriminator: "employeeType",
  mapping: {
    "Engineer": {
      properties: {
        jobType: {enum: ["Full Time", "Part Time"]},
        employeeId: {type: "string"}
      }
    },
    "Manager": {
      discriminator: "jobType", // error here - Object literal may only specify known properties, and 'discriminator' does not exist in type 'JTDSchemaType<Omit<employeeManagerL1 | employeeManagerL2, "employeeType">, Record<string, never>>'.
    }
  }
}
```
As you can see, I'm stuck while defining the 2nd level of discriminator

**What do you think is the correct solution to problem?**
The `mapping` field does not allow adding a `discriminator` property for nested discriminators, could not find any mention of nested discriminators for JTD in the documentation

**Will you be able to implement it?**
Not sure how, but happy to help