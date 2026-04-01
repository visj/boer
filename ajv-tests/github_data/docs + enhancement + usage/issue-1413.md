# [1413] Change from v6 to v7: schema object itself used as a key for compiled schema function, not serialization

Hi! I have noticed that after updating from v6 to v7, if you pass the same schema but with a different reference there's an increment on the memory used leading this to a potential memory leak. I understand that this is not the recommended way to use the library, but because there's not explicit mention about this change (that I have found) and I think other people could have not noticed this, adding a warning to the changelog or reviewing this if it was not an intentional change would be helpful.

Here is an example where the difference in memory can be observed between 6.12.6 and 7.0.2

```
const Ajv = require('ajv').default
const ajvInstance = new Ajv()

const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time))

async function start () {
	while (true) {
		const schema = {
			type: 'object',
			properties: {
				test: {type: 'number'}
			}	
		}
		
		const data = {
			test: Math.random()
		}

		ajvInstance.validate(schema, data)
		await sleep(10)
	}
}

start()
```