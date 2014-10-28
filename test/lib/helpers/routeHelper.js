/*
 * catberry
 *
 * Copyright (c) 2014 Denis Rechkunov and project contributors.
 *
 * catberry's license follows:
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * This license applies to all parts of catberry that are not externally
 * maintained libraries.
 */

'use strict';

var assert = require('assert'),
	routeHelper = require('../../../lib/helpers/routeHelper');

describe('lib/helpers/routeHelper', function () {
	describe('#removeEndSlash', function () {
		it('should remove slash at the end of absolute URI', function () {
			var uri = 'http:///some/ggg/dsd/',
				expected = 'http:///some/ggg/dsd';

			var result = routeHelper.removeEndSlash(uri);
			assert.strictEqual(result, expected);
		});
		it('should remove slash at the end of relative URI', function () {
			var uri = 'ggg/dsd/',
				expected = 'ggg/dsd';

			var result = routeHelper.removeEndSlash(uri);
			assert.strictEqual(result, expected);
		});
		it('should remove slash at the end of URI with hash', function () {
			var uri = 'http:///some/ggg/dsd/#some',
				expected = 'http:///some/ggg/dsd#some';

			var result = routeHelper.removeEndSlash(uri);
			assert.strictEqual(result, expected);
		});
		it('should remove slash at the end of URI with search', function () {
			var uri = 'http:///some/ggg/dsd/?arg=some',
				expected = 'http:///some/ggg/dsd?arg=some';

			var result = routeHelper.removeEndSlash(uri);
			assert.strictEqual(result, expected);
		});
		it('should return empty string if URI is not a string', function () {
			var uri = null,
				expected = '';

			var result = routeHelper.removeEndSlash(uri);
			assert.strictEqual(result, expected);
		});
		it('should return URI as is if URI is a root', function () {
			var uri = '/';

			var result = routeHelper.removeEndSlash(uri);
			assert.strictEqual(result, uri);
		});
		it('should return URI as is if URI is a root with hash', function () {
			var uri = '/#hash';

			var result = routeHelper.removeEndSlash(uri);
			assert.strictEqual(result, uri);
		});
		it('should return URI as is if URI is a root with search', function () {
			var uri = '/?arg=some';

			var result = routeHelper.removeEndSlash(uri);
			assert.strictEqual(result, uri);
		});
	});

	describe('#getUriMapperByRoute', function () {

		it('should return null if expression is empty', function (done) {
			var mapper = routeHelper.getUriMapperByRoute(undefined);
			assert.strictEqual(mapper, null);
			mapper = routeHelper.getUriMapperByRoute(null);
			assert.strictEqual(mapper, null);
			mapper = routeHelper.getUriMapperByRoute('');
			assert.strictEqual(mapper, null);
			done();
		});

		it('should return correct mapper for parametrized expression',
			function (done) {
				var expression1 = '/:first[  module1,module2,   module3   ]' +
						'/some:postfix[module1, module2]' +
						'/:simple[module1]' +
						'/:prefix[module3]details' +
						'?filter=:filter[module2]' +
						'&:query[module3]=:value[module3]',
					mapper = routeHelper.getUriMapperByRoute(expression1);

				var testUri1 = '/firstValue' +
					'/somePostfixValue' +
					'/simpleValue' +
					'/SomePrefixValuedetails' +
					'?filter=byDate' +
					'&someQuery=someValue';

				assert.strictEqual(mapper.expression.test(testUri1), true);
				var state1 = mapper.map(testUri1);
				assert.strictEqual(Object.keys(state1).length, 3);

				assert.strictEqual(Object.keys(state1.module1).length, 3);
				assert.strictEqual(state1.module1.first, 'firstValue');
				assert.strictEqual(state1.module1.postfix, 'PostfixValue');
				assert.strictEqual(state1.module1.simple, 'simpleValue');

				assert.strictEqual(Object.keys(state1.module2).length, 3);
				assert.strictEqual(state1.module2.first, 'firstValue');
				assert.strictEqual(state1.module2.postfix, 'PostfixValue');
				assert.strictEqual(state1.module2.filter, 'byDate');

				assert.strictEqual(Object.keys(state1.module3).length, 4);
				assert.strictEqual(state1.module3.first, 'firstValue');
				assert.strictEqual(state1.module3.prefix, 'SomePrefixValue');
				assert.strictEqual(state1.module3.query, 'someQuery');
				assert.strictEqual(state1.module3.value, 'someValue');

				var testUri2 = '/firstValue' +
					'/somePostfixValue' +
					'/simpleValue' +
					'/SomePrefixValuedetails';

				var state2 = mapper.map(testUri2);
				assert.strictEqual(typeof(state2), 'object');
				assert.strictEqual(Object.keys(state2).length, 0);

				var expression2 = ':first[module1]' +
						':second[module1,module2]' +
						':third[module3]',
					mapper2 = routeHelper.getUriMapperByRoute(expression2),
					testUri3 = 'some';

				assert.strictEqual(mapper2.expression.test(testUri3), true);
				var state3 = mapper.map(testUri3);
				assert.strictEqual(typeof(state3), 'object');
				assert.strictEqual(Object.keys(state3).length, 0);

				done();
			});

		it('should return correct mapper for non-parametrized string',
			function (done) {
				var uri = '/some/test?filter=date',
					mapper = routeHelper.getUriMapperByRoute(uri);

				assert.strictEqual(mapper.expression.test(uri), true);
				var state = mapper.map(uri);
				assert.strictEqual(typeof(state), 'object');
				assert.strictEqual(Object.keys(state).length, 0);
				done();
			});
	});
	describe('#getEventMapperByRule', function () {
		it('should return correct mapper for parametrized string', function () {
			var eventName = 'some:param1-:param2  -> ' +
					'  eventName  [   module1, module2     ]',
				mapper = routeHelper.getEventMapperByRule(eventName),
				testEvent = 'some59-73';

			assert.strictEqual(mapper.expression.test(testEvent), true);
			assert.strictEqual(mapper.eventName, 'eventName');
			assert.strictEqual(mapper.moduleNames.length, 2);
			assert.strictEqual(mapper.moduleNames[0], 'module1');
			assert.strictEqual(mapper.moduleNames[1], 'module2');

			var parameters = mapper.map(testEvent);
			assert.strictEqual(parameters.param1, '59');
			assert.strictEqual(parameters.param2, '73');
		});

		it('should return correct mapper for non-parametrized string',
			function () {
				var eventName = 'some->eventName[module1, module2]',
					mapper = routeHelper.getEventMapperByRule(eventName),
					testEvent = 'some';

				assert.strictEqual(mapper.expression.test(testEvent), true);
				assert.strictEqual(mapper.eventName, 'eventName');
				assert.strictEqual(mapper.moduleNames.length, 2);
				assert.strictEqual(mapper.moduleNames[0], 'module1');
				assert.strictEqual(mapper.moduleNames[1], 'module2');

				var parameters = mapper.map(testEvent);
				assert.strictEqual(Object.keys(parameters).length, 0);
			});

		it('should return null for incorrect event definition', function () {
			var eventName = 'some:param1-:param2  - ' +
					'  eventName  [   module1, module2     ]',
				mapper = routeHelper.getEventMapperByRule(eventName);

			assert.strictEqual(mapper, null);
		});

		it('should return null for empty event definition', function () {
			var mapper = routeHelper.getEventMapperByRule('');
			assert.strictEqual(mapper, null);
			mapper = routeHelper.getEventMapperByRule(null);
			assert.strictEqual(mapper, null);
			mapper = routeHelper.getEventMapperByRule(undefined);
			assert.strictEqual(mapper, null);
		});

		it('should return null for event definition without module', function () {
			var mapper = routeHelper.getEventMapperByRule('some->some');
			assert.strictEqual(mapper, null);
		});
	});
});
