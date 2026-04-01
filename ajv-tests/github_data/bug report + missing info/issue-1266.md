# [1266] "Patterns" Regex Return Error, But in Regex Test has been right


**What version of Ajv are you using? Does the issue happen if you use the latest version?**
"ajv": "^6.12.4"
"ajv-errors": "^1.0.1"



**Ajv options object**


```
const ajv = new Ajv({ allErrors: true, jsonPointers: true });
require('ajv-errors')(ajv);

```


**JSON Schema**

```
const SchemaPersonData = {
  type: 'object',
  required: [
    'fullName',
    'cellphone',
    'email'
    'cpf'
  ],
  errorMessages: {
    required: {
      fullName: "Precisa do seu nome completo",
      cellphone: "Precisa do seu celular" ,
      email: "Precisa do seu email",
      cpf: "Precisa do seu CPF"
    },
    pattern: {
      fullName: "Nome completo inválido",
      cellphone: "Número de celular inválido",
      email: "Email inválido",
      cpf: "CPF inválido"
    }
  },
  properties: {
    fullName: {
      title: 'Nome completo',
      type: 'string',
      pattern: "^[A-ZÀ-Ÿ][A-zÀ-ÿ']+\s([A-zÀ-ÿ']\s?)*[A-ZÀ-Ÿ][A-zÀ-ÿ']+$",
      placeholder: 'escreva seu nome completo',
      minLength: 5,
      maxLength: 140
    },
    cellphone: {
      title: 'Celular',
      type: 'string',
      pattern: '^.55 \([0-9]{2}\) [0-9]{4,5}\-[0-9]{4}$',
      mask: '+55 ([00]) [00000]-[0000]',
      placeholder: 'escreva seu número de celular com DDD'
    },
    email: {
      title: 'Email',
      type: 'string',
      pattern: '^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$',
      placeholder: 'escreva seu email'
    },
    cpf: {
      title: 'CPF',
      type: 'string',
      pattern: '^[0-9]{3}\.[0-9]{3}\.[0-9]{3}\-[0-9]{2}$',
      placeholder: 'escreva seu CPF',
      mask: '[000].[000].[000]-[00]'
    }
  }
};

export default SchemaPersonData;


```



**Your code**

```
export default function buildForm(schema) {
  const validateValues = ajv.compile(schema);
  const validate = values => {
    const valid = validateValues(values);
    if (!valid) {
      return validateValues.errors.reduce((result, error) => {
        const property = error.dataPath
          ? error.dataPath.substr(1)
          : error.params['missingProperty'];
        result[property] = buildErrorsMessage(error.keyword, property);
        return result;
      }, {});
    }
    return {};
  };
  const buildErrorsMessage = (keyword, property) => {
    return !!keyword &&
      !!property &&
      !!schema &&
      !!schema.errorMessages &&
      !!schema.errorMessages[keyword] &&
      schema.errorMessages[keyword][property]
  }

  const FormWithSchema = (props) => <RenderForm {...props} schema={schema} />
  const ReduxFormWithSchema = reduxForm({
    form: "post",
    validate
  })(FormWithSchema);

  
  return ReduxFormWithSchema;
}

```


**Validation result, data AFTER validation, error messages**
Has required and patterns validations


**What results did you expect?**
No validations errors

