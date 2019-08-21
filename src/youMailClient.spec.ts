import { describe, it } from 'mocha';
import * as td from 'testdouble';
import * as sendRequestModule from './sendRequest';
import { ApiResponse } from './apiResponse';
import { StatusCode } from './statusCode';
import { YouMailClient } from './youMailClient';
import * as assert from 'assert';

describe('youMailClient', () => {
  afterEach(() => {
    td.reset();
  });

  it('returns spamRisk when the API record is found', async () => {
    const res: ApiResponse = {
      statusCode: StatusCode.SuccessfulQuery,
      recordFound: true,
      spamRisk: { level: 2 },
      timestamp: 'the timestamp'
    };

    td.replace(sendRequestModule, 'sendRequest');
    td.when(
      sendRequestModule.sendRequest(
        td.matchers.contains({ callerNumber: 'caller phone number' })
      )
    ).thenResolve(res);

    const client = new YouMailClient('the api key', 'the api sid');
    const result = await client.lookup('caller phone number');

    assert(result.ok);
    assert.strictEqual(result.spamRisk, res.spamRisk!.level);
  });

  it('returns undefined spamRisk when the API record is not found', async () => {
    const res: ApiResponse = {
      statusCode: StatusCode.SuccessfulQuery,
      recordFound: false,
      timestamp: 'the timestamp'
    };

    td.replace(sendRequestModule, 'sendRequest');
    td.when(
      sendRequestModule.sendRequest(
        td.matchers.contains({ callerNumber: 'caller phone number' })
      )
    ).thenResolve(res);

    const client = new YouMailClient('the api key', 'the api sid');
    const result = await client.lookup('caller phone number');

    assert(result.ok);
    assert.strictEqual(result.spamRisk, undefined);
  });

  it('passes through the raw API result', async () => {
    const res: ApiResponse = {
      statusCode: StatusCode.SuccessfulQuery,
      recordFound: false,
      spamRisk: { level: 1 },
      timestamp: 'the timestamp'
    };

    td.replace(sendRequestModule, 'sendRequest');
    td.when(
      sendRequestModule.sendRequest(
        td.matchers.contains({ callerNumber: 'caller phone number' })
      )
    ).thenResolve(res);

    const client = new YouMailClient('the api key', 'the api sid');
    const result = await client.lookup('caller phone number');

    assert.deepStrictEqual(result.raw, res);
  });

  it('sets properties appropriately when an error is returned', async () => {
    const res: ApiResponse = {
      statusCode: StatusCode.InternalError,
      recordFound: false,
      errors: [],
      timestamp: 'the timestamp'
    };

    td.replace(sendRequestModule, 'sendRequest');
    td.when(
      sendRequestModule.sendRequest(
        td.matchers.contains({ callerNumber: 'caller phone number' })
      )
    ).thenResolve(res);

    const client = new YouMailClient('the api key', 'the api sid');
    const result = await client.lookup('caller phone number');

    assert.strictEqual(result.ok, false);
    assert.strictEqual(result.spamRisk, undefined);
  });

  it('queries the normalized version of the phone number', async () => {
    const res: ApiResponse = {
      statusCode: StatusCode.InternalError,
      recordFound: true,
      spamRisk: { level: 2 },
      timestamp: 'the timestamp'
    };

    td.replace(sendRequestModule, 'sendRequest');
    td.when(
      sendRequestModule.sendRequest(td.matchers.contains({ callerNumber: '2068671234' }))
    ).thenResolve(res);

    const client = new YouMailClient('the api key', 'the api sid');
    const result = await client.lookup('+1 (206) 867-1234');

    assert.strictEqual(result.ok, false);
    assert.strictEqual(result.spamRisk, res.spamRisk!.level);
  });

  it('doesn’t normalize invalid phone numbers', async () => {
    const res: ApiResponse = {
      statusCode: StatusCode.InternalError,
      recordFound: false,
      spamRisk: { level: 2 },
      timestamp: 'the timestamp'
    };

    td.replace(sendRequestModule, 'sendRequest');
    td.when(
      sendRequestModule.sendRequest(
        td.matchers.contains({ callerNumber: 'not a valid phone number' })
      )
    ).thenResolve(res);

    const client = new YouMailClient('the api key', 'the api sid');
    const result = await client.lookup('not a valid phone number');

    assert.strictEqual(result.ok, false);
    assert.strictEqual(result.spamRisk, undefined);
  });

  it('passes through and normalizes calledNumber', async () => {
    const res: ApiResponse = {
      statusCode: StatusCode.InternalError,
      recordFound: true,
      spamRisk: { level: 2 },
      timestamp: 'the timestamp'
    };

    td.replace(sendRequestModule, 'sendRequest');
    td.when(
      sendRequestModule.sendRequest(td.matchers.contains({ calledNumber: '2068671234' }))
    ).thenResolve(res);

    const client = new YouMailClient('the api key', 'the api sid');
    const result = await client.lookup({
      callerNumber: '206-867-5309',
      calledNumber: '+1 (206) 867-1234'
    });

    assert.strictEqual(result.ok, false);
    assert.strictEqual(result.spamRisk, res.spamRisk!.level);
  });

  it('doesn’t normalize calledNumber if it isn’t valid', async () => {
    const res: ApiResponse = {
      statusCode: StatusCode.InternalError,
      recordFound: true,
      spamRisk: { level: 2 },
      timestamp: 'the timestamp'
    };

    td.replace(sendRequestModule, 'sendRequest');
    td.when(
      sendRequestModule.sendRequest(td.matchers.contains({ calledNumber: 'not valid' }))
    ).thenResolve(res);

    const client = new YouMailClient('the api key', 'the api sid');
    const result = await client.lookup({
      callerNumber: '206-867-5309',
      calledNumber: 'not valid'
    });

    assert.strictEqual(result.ok, false);
    assert.strictEqual(result.spamRisk, res.spamRisk!.level);
  });

  it('passes through callerId', async () => {
    const res: ApiResponse = {
      statusCode: StatusCode.InternalError,
      recordFound: true,
      spamRisk: { level: 2 },
      timestamp: 'the timestamp'
    };

    td.replace(sendRequestModule, 'sendRequest');
    td.when(
      sendRequestModule.sendRequest(td.matchers.contains({ callerId: 'JUST TESTING' }))
    ).thenResolve(res);

    const client = new YouMailClient('the api key', 'the api sid');
    const result = await client.lookup({
      callerNumber: '206-867-1234',
      callerId: 'JUST TESTING'
    });

    assert.strictEqual(result.ok, false);
    assert.strictEqual(result.spamRisk, res.spamRisk!.level);
  });
});
