import * as assert from 'assert';
import { describe, it } from 'mocha';
import * as fetchModule from 'node-fetch';
import * as td from 'testdouble';
import * as sendRequestModule from './sendRequest';
import util from './util';

describe('sendRequest', () => {
  afterEach(() => {
    td.reset();
  });

  it('makes a request to the expected url', async () => {
    const expectedUrl =
      'https://dataapi.youmail.com/api/v2/phone/the-caller-number?format=json';

    td.replace(fetchModule, 'default');
    td.when(fetchModule.default(expectedUrl, td.matchers.anything())).thenResolve({
      json: () => 'the expectedUrl was fetched'
    });

    const result = await sendRequestModule.sendRequest({
      apiSid: 'the api sid',
      apiKey: 'the api key',
      callerNumber: 'the-caller-number'
    });

    assert.strictEqual(result, 'the expectedUrl was fetched');
  });

  it('includes caller id in the url if passed', async () => {
    const expectedUrl =
      'https://dataapi.youmail.com/api/v2/phone/the-caller-number?format=json&callerId=the-caller-id';

    td.replace(fetchModule, 'default');
    td.when(fetchModule.default(expectedUrl, td.matchers.anything())).thenResolve({
      json: () => 'the expectedUrl was fetched'
    });

    const result = await sendRequestModule.sendRequest({
      apiSid: 'the api sid',
      apiKey: 'the api key',
      callerNumber: 'the-caller-number',
      callerId: 'the-caller-id'
    });

    assert.strictEqual(result, 'the expectedUrl was fetched');
  });

  it('includes callee in the url if a valid called number is passed', async () => {
    const expectedUrl =
      'https://dataapi.youmail.com/api/v2/phone/the-caller-number?format=json&callee=the-called-number';

    td.replace(util, 'isValidNorthAmericanNumber');
    td.when(util.isValidNorthAmericanNumber('the-called-number')).thenReturn(true);

    td.replace(fetchModule, 'default');
    td.when(fetchModule.default(expectedUrl, td.matchers.anything())).thenResolve({
      json: () => 'the expectedUrl was fetched'
    });

    const result = await sendRequestModule.sendRequest({
      apiSid: 'the api sid',
      apiKey: 'the api key',
      callerNumber: 'the-caller-number',
      calledNumber: 'the-called-number'
    });

    assert.strictEqual(result, 'the expectedUrl was fetched');
  });

  it('does not include callee in the url if an invalid called number is passed', async () => {
    const expectedUrl =
      'https://dataapi.youmail.com/api/v2/phone/the-caller-number?format=json';

    td.replace(util, 'isValidNorthAmericanNumber');
    td.when(util.isValidNorthAmericanNumber('the-called-number')).thenReturn(false);

    td.replace(fetchModule, 'default');
    td.when(fetchModule.default(expectedUrl, td.matchers.anything())).thenResolve({
      json: () => 'the expectedUrl was fetched'
    });

    const result = await sendRequestModule.sendRequest({
      apiSid: 'the api sid',
      apiKey: 'the api key',
      callerNumber: 'the-caller-number',
      calledNumber: 'the-called-number'
    });

    assert.strictEqual(result, 'the expectedUrl was fetched');
  });
});
