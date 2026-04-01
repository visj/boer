# [754] Ref different properties in a nested array based on different condition

I have an array of objects where one of those properties is an array. In the nested array, there exist some properties. I need to further extend those properties depending on the value of a certain property. Any idea how can I accomplish such task?

`
attachments: {
    type: 'array',
    minItems: 1,
    properties: {
        

        content: {
            $ref: '#/definitions/non_empty_string',
        },

         actions: {
             type: 'array',
             minItems: 1,
             items: {
                type: 'object',
                properties: {
                    name: {
                        $ref: '#/definitions/non_empty_string',
                    },
        
                    text: {
                        $ref: '#/definitions/non_empty_string',
                    },
        
                    value: {
                        $ref: '#/definitions/non_empty_string',
                    },
        
                    style: {
                        enum: ['default', 'primary', 'danger'],
                    },
        
                    type: {
                        enum: ['button', 'select'],
                    },
        
                    // $ref here different properties 
                    //depending on the type
                }
            }
         }
    }
}
`