const fs = require('fs');
const path = require('path');
const { Test } = require('../src');

const t = new Test();

t.test('test 1', t => {
  t.not.assert(false);
	t.throws(() => { });
	t.throws(() => { throw new Error('throws'); });
	t.not.throws(() => { });
	t.not.throws(() => { throw new Error('not throws'); });
});
/**
t.test('test 2', t => {
	t.assert(true);

	t.equal(1,1);
	t.equal(2,2, 'custom equal message');
});

t.skip.test('test 3', t => {
	t.test('test 3.1', t => {
		t.test('test 3.1.1', t => {
			t.assert(true);
		});
	});

	t.equal(1,2);
});

t.todo.test('test 4', t => {
	t.assert(true);
});

t.skip.test('test 5', t => {
	t.assert(false);
});
*/
t.run();
