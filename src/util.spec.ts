import * as assert from 'assert';
import { describe, it } from 'mocha';
import * as td from 'testdouble';
import util from './util';

describe('util', () => {
  afterEach(() => {
    td.reset();
  });

  describe('isValidNorthAmericanNumber', () => {
    it('should recognize US local numbers', () => {
      const numbers = [
        '(360) 222-3333',
        '503-222-3333',
        '2126875309',
        '212.687.5309',
        '212 687 5309',
        '+12126875309',
        '1-212-687-5309'
      ];

      for (const number of numbers) {
        assert.strictEqual(util.isValidNorthAmericanNumber(number), true, number);
      }
    });

    it('should recognize US toll-free numbers', () => {
      const numbers = [
        '(800) 222-3333',
        '888-222-3333',
        '8776875309',
        '866.687.5309',
        '855 687 5309',
        '+18446875309',
        '1-833-687-5309'
      ];

      for (const number of numbers) {
        assert.strictEqual(util.isValidNorthAmericanNumber(number), true, number);
      }
    });

    it('should recognize Candian local numbers', () => {
      const numbers = ['(604) 222-3333'];

      for (const number of numbers) {
        assert.strictEqual(util.isValidNorthAmericanNumber(number), true, number);
      }
    });

    it('should return false on invalid numbers', () => {
      const numbers = [
        '(800) 222-333', // missing a digit
        'not a phone number',
        '311-222-4444', // invalid NXX
        '+44 20 7234 3456' // UK number not North American
      ];

      for (const number of numbers) {
        assert.strictEqual(util.isValidNorthAmericanNumber(number), false, number);
      }
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format valid phone numbers', () => {
      const fixtures = [
        ['360-222-3333', '+13602223333'],
        ['1-212-687-5309', '+12126875309'],
        ['+44 20 7234 3456', '+442072343456']
      ];

      for (const [input, expectedOutput] of fixtures) {
        assert.strictEqual(util.formatPhoneNumber(input), expectedOutput, input);
      }
    });

    it('should pass through invalid phone numbers', () => {
      const fixtures = [
        ['not a phone number', 'not a phone number'],
        ['311-222-4444', '311-222-4444']
      ];

      for (const [input, expectedOutput] of fixtures) {
        assert.strictEqual(util.formatPhoneNumber(input), expectedOutput, input);
      }
    });
  });
});
