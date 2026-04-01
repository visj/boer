# [1635] AJV taking too long for compile schema

Hi, i am using ajv for validate huge jsons.

I'm parsing 1000 lines to json and sending to ajv.compile but is taking about 30,40 secons to compile, it is normal take too long?

I used to had this working fine, but since last weekend the compile is almost impossible to use.
I'll post my method of validation , if it is something wrong please tell me, i dont know what to do anymore.
`export function validateSchema(
  arrayJson: Array<iSchema>,
  schema: any,
  file: Files,
  maxErrors: number,
  numErrors: number,
  callback: Function
) {
  Arrayerror = [];
  let teste = 0;
  try {
    for (var values of arrayJson) {
      if (numErrors >= maxErrors) {
        break;
      }
      const ajvTeste = new Ajv({
        strict: false,
        allErrors: true,
      });
      require("ajv-keywords")(ajvTeste);
      addFormats(ajvTeste);
      AjvErrors(ajvTeste);

      let validate2 = ajvTeste.compile(schema);

      if (validate2(values)) {
        teste++;
      } else {
        ErrorFields =
          validate2.errors &&
          validate2.errors?.map((vals) => {
            return vals.dataPath;
          });
      }

      if (ajvTeste.errorsText(validate2.errors) !== "No errors") {
        numErrors++;
        Arrayerror.push({
          line: values.seq,
          errors: ajvTeste.errorsText(validate2.errors).split(","),
          campo: Array.prototype.join.call(ErrorFields).split(","),
          file: file,
          layout: values.tabela,
          full_line_error: values.linha,
        });
      }
    }
    return callback(Arrayerror, numErrors);
  } catch (e) {
    console.log("w");
  }
}`