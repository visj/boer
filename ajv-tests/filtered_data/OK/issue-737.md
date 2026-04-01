# [737] Array Validation stops on first element

my schema:

```javascript
creditAccounts: {
                type: 'array',
                items: [ {
                    type: 'object',
                    properties: {
                        recordType: {
                            type: 'number',
                            const: 3,
                        },
                        beneficiaryAccountNumber: {type: 'string'},
                        beneficiarySortCode: {type: 'string'},
                        paymentDate: {type: 'string'},
                        paymentCurrency: {type: 'string'},
                        paymentAmount: {type: 'number'},
                        beneficiaryName: {type: 'string'},
                        paymentReference: {type: 'string'},
                        dealerId: {type: 'string'},
                        dealerRate: {type: 'number'},
                    },
                    required: ['recordType', 'beneficiaryAccountNumber', 'beneficiarySortCode', 'paymentDate', 'paymentCurrency'],
                }]
```
when I validate,.it fails for the first element in my array but not the others which have the same error.


