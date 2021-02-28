/**
 * @type {number}
 */
var Seed = 0;

/**
 * @const
 * @type {Object<string,string>}
 */
var Asserts = {
	pass: 'should pass',
	fail: 'should not fail',
	equal: 'should be equal',
	assert: 'should be truthy',
	throws: 'should throw',
};

/**
 * @const
 * @type {Object<string,string>}
 */
var Negates = {
	pass: 'should not pass',
	fail: 'should fail',
	equal: 'should not be equal',
	assert: 'should not be truthy',
	throws: 'should not throw',
};

/**
 * @const
 * @enum {number}
 */
var Flag = {
	Not: 1,
	Pass: 2,
	Fail: 4,
	Only: 8,
	Skip: 16,
	Todo: 32,
	Serial: 64,
	Root: 128,
	Init: 256,
	Assert: 512,
	Exit: 1024,
	Debug: 2048,
	Wait: 4096,
	Pending: 8192,
};

/**
 * @interface
 */
function Async() { }

/**
 * @type {*}
 */
Async.prototype.ctx;

/**
 *
 */
Async.prototype.end = function() { }

/**
 *
 */
Async.prototype.wait = function() { }


/**
 * @interface
 */
function Suite() {}

/**
 * @type {number}
 */
Suite.prototype.flag;

/**
 * @type {string}
 */
Suite.prototype.message;

/**
 * @type {number}
 */
Suite.prototype.planned;

/**
 * @type {number}
 */
Suite.prototype.duration;

/**
 * @type {Array<Suite>}
 */
Suite.prototype.tests;

/**
 * @type {Array<Assertion>}
 */
Suite.prototype.asserts;

/**
 * @interface
 */
function Report() {}

/**
 * @param {Suite}
 */
Report.prototype.onInit = function (suite) {}

/**
 * 
 * @param {Suite} suite 
 */
Report.prototype.onTestInit = function (suite) {}

/**
 * 
 * @param {Suite} suite
 */
Report.prototype.onTestExit = function (suite) {}

/**
 * @param {Suite} suite
 */
Report.prototype.onExit = function (suite) {}

function Result() {
	this.pass = 0;
	this.fail = 0;
	this.skip = 0;
	this.todo = 0;
	this.seed = 1;
	this.indent = '';
}

/**
 * @constructor
 * @implements {Report}
 */
function Reporter() {
	/**
	 * @type {Result}
	 */
	this.opts = new Result();
}

/**
 * @param {Suite} suite
 */
Reporter.prototype.onInit = function (suite) {
	console.log('TAP version 13');
}

/**
 * 
 * @param {Suite} suite
 */
Reporter.prototype.onTestInit = function (suite) {}

/**
 * @param {Suite} suite
 */
Reporter.prototype.onTestExit = function (suite) {
	var lines = [];
	print(suite, this.opts, lines, suite.flag);
	console.log(lines.join('\n'));
}

/**
 * @param {Suite} suite
 */
Reporter.prototype.onExit = function (suite) {
	console.log(
		'\n# ' + (this.opts.fail > 0 ? 'not ok ' : 'ok ') + suite.duration + 'ms' +
		'\n# pass: ' + this.opts.pass +
		'\n# fail: ' + this.opts.fail +
		'\n# skip: ' + this.opts.skip +
		'\n# todo: ' + this.opts.todo
	);
}

/**
 * @param {Suite} suite
 * @param {Result} opts
 * @param {Array<string>} lines
 * @param {number} flag
 */
function print(suite, opts, lines, flag) {
	var str;
	var pass = true;
	str = opts.indent + '# Subtest: ' + suite.message;
	lines.push(str);
	opts.indent += '    ';
	for (var i = 0; i < suite.asserts.length; i++) {
		var assert = suite.asserts[i];
		if (assert.flag & Flag.Pass || assert.flag & Flag.Skip || flag & Flag.Skip) {
			str = opts.indent + 'ok ' + opts.seed++ + ' - ' +
				(assert.message != null ? assert.message : (assert.flag & Flag.Not ? Negates[assert.operator] : Asserts[assert.operator])
				);
			if (assert.flag & Flag.Skip || flag & Flag.Skip) {
				opts.skip++;
				str += ' # SKIP';
			} else if (assert.flag & Flag.Todo || flag & Flag.Todo) {
				opts.todo++;
				str += ' # TODO';
			} else {
				opts.pass++;
			}
		} else {
			pass = false;
			str = opts.indent + 'not ok ' + opts.seed++ + ' - ' +
				(assert.message != null ? assert.message : (assert.flag & Flag.Not ? Negates[assert.operator] : Asserts[assert.operator])
				) + (flag & Flag.Todo ? ' # TODO' : '') +
				'\n' + opts.indent + '  ---' +
				'\n' + opts.indent + '  expected: ' + assert.expected +
				'\n' + opts.indent + '  actual: ' + assert.actual +
				'\n' + opts.indent + '  at: ' + assert.trace +
				'\n' + opts.indent + '  operator: ' + assert.operator +
				'\n' + opts.indent + '  ...';
			if (flag & Flag.Todo) {
				opts.todo++;
			} else {
				opts.fail++;
			}
		}
		lines.push(str);
	}
	if (suite.tests.length > 0) {
		for (i = 0; i < suite.tests.length; i++) {
			pass = print(suite.tests[i], opts, lines, flag) && pass;
		}
	}
	lines.push(opts.indent + '1..' + suite.asserts.length);
	opts.indent = opts.indent.slice(0, -4);
	if (pass) {
		str = opts.indent + 'ok - ' + suite.message + ' # ' + suite.duration + 'ms';
	} else {
		str = opts.indent + 'not ok - ' + suite.message + ' # ' + suite.duration + 'ms';
	}
	lines.push(str);
	return pass;
}

function getStackTrace() {
	var trace = new Error().stack;
	if (trace != null) {
		var lines = trace.split('\n').filter((f, i) => i > 0);
		var line = lines.filter(f => f.indexOf('boer.js') === -1)[0];
		var file = /\((.*)\)/.exec(line)[1];
		try {
			return file.replace(__dirname, '');
		} catch (err) {
			return file;
		}
	}
}


/**
 * @constructor
 * @implements {Async}
 * @implements {Suite}
 * @param {Report=} reporter
 */
function Test(reporter) {
	/**
	 * @public
	 * @type {number}
	 */
	this.flag = Flag.Init | Flag.Root | Flag.Serial;
	/**
	 * @public
	 * @type {Array<Test>}
	 */
	this.tests = [];
	/**
	 * @public
	 * @type {Array<Assertion>}
	 */
	this.asserts = [];
	/**
	 * @public
	 * @type {Negate}
	 */
	this.not = new Negate(this.asserts);
	/**
	 * @public
	 * @type {Directive}
	 */
	this.only = new Directive(Flag.Only, this.tests);
	/**
	 * @public
	 * @type {Directive}
	 */
	this.skip = new Directive(Flag.Skip, this.tests);
	/**
	 * @public
	 * @type {Directive}
	 */
	this.todo = new Directive(Flag.Todo, this.tests);
	/**
	 * @public
	 * @type {string|null}
	 */
	this.message = null;
	/**
	 * @public
	 * @type {number}
	 */
	this.planned = -1;
	/**
	 * @public
	 * @type {number}
	 */
	this.duration = -1;
	/**
	 * @type {Test|null}
	 */
	this._owner = null;
	/**
	 * @protected
	 * @type {Report}
	 */
	this._reporter = reporter || new Reporter();
	/**
	 * @protected
	 * @type {number}
	 */
	this._index = 0;
	/**
	 * @type {null|function(Test): void}
	 */
	this._scope = null;
}

/**
 * @constructor
 * @extends {Test}
 * @param {Array<Assertion>} asserts
 */
function Negate(asserts) {
	/**
	 * @public
	 * @type {number}
	 */
	this.flag = Flag.Not;
	/**
	 * @public
	 * @type {Array<Assertion>}
	 */
	this.asserts = asserts;
}

Negate.prototype = Test.prototype;

/**
 * @constructor
 * @extends {Test}
 * @param {number} flag
 * @param {Array<Test>} tests
 */
function Directive(flag, tests) {
	/**
	 * @public
	 * @type {number}
	 */
	this.flag = flag;
	/**
	 * @public
	 * @type {Queue<Suite>}
	 */
	this.tests = tests;
}

Directive.prototype = Test.prototype;

/**
 * @constructor
 * @param {number} flag 
 * @param {string=} message 
 * @param {string=} operator 
 * @param {*=} actual 
 * @param {*=} expected 
 * @param {string=} trace 
 */
function Assertion(flag, message, operator, actual, expected, trace) {
	/**
	 * @type {number}
	 */
	this.flag = flag;
	/**
	 * @type {string}
	 */
	this.message = message;
	/**
	 * @type {string}
	 */
	this.operator = operator;
	/**
	 * @type {*}
	 */
	this.actual = actual;
	/**
	 * @type {*}
	 */
	this.expected = expected;
	/**
	 * @type {string}
	 */
	this.trace = trace;
}

/**
 * @protected
 * @param {number} flag
 * @returns {boolean}
 */
Test.prototype.assertion = function(flag, operator, actual, expected, message) {
	if ((flag & (Flag.Pass | Flag.Debug)) === Flag.Pass) {
		this.asserts.push(new Assertion(flag, message, operator));
	} else {
		this.asserts.push(new Assertion(flag, message, operator, actual, expected, getStackTrace()));
	}
	return (flag & Flag.Pass) !== 0;
}

/**
 * 
 * @param {boolean} condition 
 * @param {string=} message
 * @returns {boolean}
 */
Test.prototype.assert = function (condition, message) {
	var flag = this.flag;
	if (flag & Flag.Not) {
		return this.assertion(flag | (condition ? Flag.Fail : Flag.Pass), 'assert', condition, false, message);
	} else {
		return this.assertion(flag | (condition ? Flag.Pass : Flag.Fail), 'assert', condition, true, message); 
	}
}

/**
 * 
 * @param {string=} message 
 * @returns {boolean}
 */
Test.prototype.fail = function (message) {
	var flag = this.flag;
	if (flag & Flag.Not) {
		return this.assertion(flag | Flag.Pass, 'fail', 'not fail called', 'not fail called', message); 
	} else {
		return this.assertion(flag | Flag.Fail, 'fail', 'fail called', 'fail not called', message);
	}
}

/**
 * 
 * @param {string=} message 
 * @returns {boolean}
 */
Test.prototype.pass = function (message) {
	var flag = this.flag;
	if (flag & Flag.Not) {
		return this.assertion(flag | Flag.Fail, 'pass', 'pass called', 'not pass called', message);
	} else {
		return this.assertion(flag | Flag.Pass, 'pass', 'pass called', 'pass called', message); 
	}
}

/**
 * 
 * @param {*} actual 
 * @param {*} expected 
 * @param {string=} message
 * @returns {boolean}
 */
Test.prototype.equal = function (actual, expected, message) {
	var flag = this.flag;
	var equal = isEqual(actual, expected);
	if (flag & Flag.Not) {
		return this.assertion(flag | (equal ? Flag.Fail : Flag.Pass), 'equal', actual, expected, message);
	} else {
		return this.assertion(flag | (equal ? Flag.Pass : Flag.Fail), 'equal', actual, expected, message);
	}
}

/**
 * @param {Function} fn
 * @param {string=} message
 */
Test.prototype.throws = function(fn, message) { 
	var caught;
	var flag = this.flag;
	try {
		fn();
	} catch(err) {
		caught = { error: err };
	}
	if (this.flag & Flag.Not) {
		return this.assertion(flag | (caught === void 0 ? Flag.Pass : Flag.Fail), 'throws', 
			caught === void 0 ? void 0 : caught.error, 'error not thrown', message);
	} else {
		return this.assertion(flag | (caught === void 0 ? Flag.Fail : Flag.Pass), 'throws', 
			caught === void 0 ? void 0 : caught.error, 'error thrown', message);
	}
}

/**
 * @param {string} message
 * @param {function(Test): void} scope
 */
Test.prototype.test = function (message, scope) {
	var test = new Test(this._reporter);
	test.message = message;
	test._scope = scope;
	test.flag |= this.flag;
	test.flag &= ~Flag.Root;
	test.flag &= ~Flag.Serial;
	this.tests.push(test);
}

/**
 * 
 */
Test.prototype.run = function () {
	if (this.flag & Flag.Init) {
		this.runScope();
	}
	if (this.tests.length > 0) {
		this.runTests();
	}
	if (this.flag & Flag.Root) {
		this.duration = new Date().valueOf() - this.duration;
		this._reporter.onExit(this);
	}
	this.duration = new Date().valueOf() - this.duration;
}

/**
 * @private
 */
Test.prototype.runScope = function () {
	if (this.flag & Flag.Root) {
		this.duration = new Date().valueOf();
		this._reporter.onInit(this);
	} else {
		this._reporter.onTestInit(this);
		try {
			this.flag |= Flag.Assert;
			this.flag &= ~Flag.Init;
			this.duration = new Date().valueOf();
			this._scope(this);
		} catch (err) {
			this.fail(String(err));
		} finally {
			this.flag |= Flag.Exit;
			this.flag &= ~Flag.Assert;
		}
	}
}

/**
 * @private
 */
Test.prototype.runTests = function () {
	var flag = this.flag;
	var tests = this.tests;
	for (; this._index < tests.length; this._index++) {
		tests[this._index].run();
		if (flag & Flag.Root) {
			this._reporter.onTestExit(tests[this._index]);
		}
	}
}

/**
 * # TODO
 * @param {function(Async): void} fn
 */
Test.prototype.setup = function(fn) {

}

/**
 * # TODO
 * @param {function(Async): void} fn
 */
Test.prototype.teardown = function(fn) {

}

/**
 * # TODO
 * @param {function(Async): void} fn
 */
Test.prototype.cleanup = function(fn) {

}

/**
 * # TODO
 */
Test.prototype.wait = function () {
	this.flag |= Flag.Wait;
}

/**
 * # TODO
 */
Test.prototype.end = function () {

}

/**
 * # TODO
 * @param {number} count
 */
Test.prototype.plan = function (count) {
	this.planned = count;
}

/**
 *
 */
Test.prototype.serial = function () {
	this.flag |= Flag.Serial;
}

/**
 * 
 * @param {*} a 
 * @param {*} b 
 * @returns {boolean}
 */
function isEqual(a, b) {
	if (a === b) {
		return true;
	}

	if (a && b && typeof a === 'object' && typeof b === 'object') {
		if (a.constructor !== b.constructor) {
			return false;
		}
		/** @type {number} */
		var i;
		var keys;
		/** @type {number} */
		var length;
		if (Array.isArray(a)) {
			length = a.length;
			if (length !== b.length) {
				return false;
			}
			for (i = 0; i < length; i++) {
				if (!equal(a[i], b[i])) {
					return false;
				}
			}
			return true;
		}
	}
	return a !== a && b !== b;
}

module.exports = {Flag: Flag, Asserts: Asserts, Negates: Negates, Test: Test}; 
