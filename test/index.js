const fs = require('fs');
const path = require('path');
const { Test } = require('../src/boer');

const tests = fs.readdirSync(path.join(__dirname, 'tests'));

function setup() {
	const obj = { buffer: '', test: new Test() };
	obj.test.pipe(function (msg) {
		obj.buffer += msg;
	});
	return obj;
}

let errors = 0;

for (var i = 0; i < tests.length; i++) {
	execute(path.join(__dirname, 'tests', tests[i]));
}

/**
 * 
 * @param {string} file 
 */
function execute(file) {
	const specs = require(file);
	specs.forEach(spec => {
		const t = setup();
		let expected = spec(t.test).join('\n');
		t.test.run(() => {
			expected = expected.replace(/\d+ms/g, '');
			t.buffer = t.buffer.replace(/\d+ms/g, '');
			if (expected !== t.buffer) {
				errors++;
				console.log('error in file ' + tests[i]);
				console.log('  ---');
				console.log('  actual:');
				if (t.buffer) {
					t.buffer.split('\n').forEach(line => console.log('    ' + line));
				}
				console.log('  expected:')
				if (expected) {
					expected.split('\n').forEach(line => console.log('    ' + line));
				}
				console.log('  ---')
			}
		});
	});

}

process.on('exit', function () {
	if (errors === 0) {
		console.log('Ok');
	} else {
		console.error(errors + ' errors in total');
	}
});