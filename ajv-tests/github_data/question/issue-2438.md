# [2438] Dynamic Error Message in Keyword Compile or Validate Methods

I've got a custom keyword that I'd like to be able to set a dynamic error message with, based on schema properties for the field being validated. I cannot find any examples of setting an error message from inside the compile function. Can I get an example of how to accomplish this? The documentation really isn't clear.


```
export function addKeywords(ajv: any) {
  ajv.addKeyword({
    keyword: "project:joint_applicant_first_name",
    type: "object",
    error: {
      message: (() => "Applicant and joint applicant names must be different.")
    },
    compile: function (schema: any) {
      return function (data: any) {
        if (schema && 
            data?.contact?.first_name && 
            data?.contact?.last_name &&
            data?.project?.joint_applicant_first_name && 
            data?.project?.joint_applicant_last_name) {
            const isValid = data.contact.first_name !== data.project.joint_applicant_first_name ||
                            data.contact.last_name !== data.project.joint_applicant_last_name;

if(isValid)
          }
// Set ErrorObject
        }
        
        return isValid;
    }
  });
```