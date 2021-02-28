export interface Assert {
	fail(message?: string): void;
	pass(message?: string): void;
	assert(condition: boolean, msg?: string): void;
	equal(actual: any, expected: any, msg?: string): void;
	throws(fn: Function, message?: string): void;
}

export interface Assertion {
	readonly flag: number;
	readonly operator: string;
	readonly message?: string;
	readonly actual?: any;
	readonly expected?: any;
	readonly trace?: string;
}

export interface Async {
	ctx: any;
	end(): void;
	wait(): void;
}

export interface Lifecycle {
	setup(fn: (t: Async) => void): void;
	teardown(fn: (t: Async) => void): void;
	cleanup(fn: (t: Async) => void): void;
}

export interface Report {
	onInit(): void;
	onTestInit(test: Suite): void;
	onTestExit(test: Suite): void;
	onExit(): void;
}

export interface Scope {
	
	test(msg: string, scope: (t: Test) => void): void;
}

export interface Suite {
	readonly flag: number;
	readonly message: string;
	readonly planned: number;
	readonly duration: number;
	readonly tests: Suite[]; 
	readonly asserts: Assertion[];
}

export interface Test extends Assert, Async, Lifecycle, Scope {
	
	readonly not: Assert;

	readonly only: Scope;
	readonly skip: Scope;
	readonly todo: Scope;

	plan(count: number): void;
	
	run(): void;
	
	serial(): void;
}

export interface TestPrototype {
	assertion(flag: number, operator: string, actual?: any, expected?: any, message?: string): void;
}

export interface TestConstructor {
	new(reporter?: Report): Test;
	readonly prototype: TestPrototype;
}

export const enum Flag {
	Not = 1,
	Pass = 2,
	Fail = 4,
	Only = 8,
	Skip = 16,
	Todo = 32,
	Serial = 64,
	Root = 128,
	Init = 256,
	Assert = 512,
	Exit = 1024,
	Debug = 2048,
	Wait = 4096,
	Pending = 8192
}

export const Asserts: { [operator: string]: string };

export const Negates: { [operator: string]: string };

export const Test: TestConstructor;
