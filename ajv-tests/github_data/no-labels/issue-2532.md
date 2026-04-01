# [2532] Async validation: not working on simple example

After reading the [async validation docs](https://ajv.js.org/guide/async-validation.html) I've tried to implement it on on [Jsonforms](https://jsonforms.io/).

Thes is the code I am using so far, it is very simplistic, only has a numeric field. On the background it makes a call to an online API and returne true or false based on the response length:



  ```
import { useState } from 'react'
import { JsonForms } from '@jsonforms/react'
import { materialCells, materialRenderers } from '@jsonforms/material-renderers'
import Box from '@mui/material/Box'
import Ajv from 'ajv'
import axios from 'axios'

const ajv = new Ajv({ allErrors: true, verbose: true, strict: "log" })

import addFormats from 'ajv-formats'

ajv.addKeyword({
    async: true,
    keyword: 'validateNumber',
    type: 'number',
    validate: checkIdExists,
    errors: true,
})

async function checkIdExists(schema, data) {
    const response = await axios.get(
        `https://rickandmortyapi.com/api/character/?name=Rick Sanchez`,
    )
    const characters = response.data.results.map((character: any) => ({
        label: character.name,
        id: character.id,
    }))

    if (characters.length < 4) {
        console.log('Return true')
        return true
    } else {
        console.log('Return false')
        const errors = [{
           keyword: "validateNumber",
            message: "Something went wrong while validating term, try again."
        }];

        throw new Ajv.ValidationError(errors);
    }
  }

addFormats(ajv)

const jsonSchema = {
    $async: true,
    properties: {
        
        cNumber: {
            type: 'integer',
            validateNumber: true, // Use custom validation
        },
    },
}

const uiSchema = {
    type: 'VerticalLayout',
    elements: [
        {
            type: 'Control',
            scope: '#/properties/cNumber',
        },
    ],
}

const initialData = {
}

export const TestJsonForms: React.FC = () => {
    const [data, setData] = useState<object>(initialData)

    const handleChange = ({ data, errors }) => {
        setData(data)
    }

    return (
        <>
            <h1>JsonForms in a Page</h1>
            <Box
                flexDirection="row"
                bgcolor="lightyellow"
                justifyContent="center"
                alignItems="center"
            >
                <JsonForms
                    schema={jsonSchema}
                    uischema={uiSchema}
                    data={data}
                    renderers={[
                        ...materialRenderers,
                    ]}
                    cells={materialCells}
                    onChange={handleChange}
                    ajv={ajv} // Pass the custom ajv instance
                    validationMode={'ValidateAndShow'}
                />
            </Box>
        </>
    )
}

export default TestJsonForms

```

On the browser console I see always the error: 

`
Uncaught (in promise) ValidationError: validation failed
    at validate10 (eval at compileSchema (chunk-GLSY35ZN.js?v=81846091:2915:30), <anonymous>:3:1898)
`

It is using ajv version "^8.17.1",

Any piece of advide or guideline will be much appreciated. Thanks! :)