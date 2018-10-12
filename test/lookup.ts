import test, { afterEach, beforeEach } from 'ava';
import * as td from 'testdouble';
import { ApiResponse } from '../src/apiResponse';
import { StatusCode } from '../src/statusCode';

let sendRequest, YouMailClient;

beforeEach(() => {
  sendRequest = td.replace('../src/sendRequest').sendRequest;
  YouMailClient = require('../src/youMailClient').YouMailClient;
});

afterEach(() => {
  td.reset();
});

test.serial('returns spamRisk when the API record is found', async t => {
  const res: ApiResponse = {
    statusCode: StatusCode.SuccessfulQuery,
    recordFound: true,
    spamRisk: { level: 2 },
    timestamp: 'the timestamp'
  };

  td.when(
    sendRequest(td.matchers.contains({ callerNumber: 'caller phone number' }))
  ).thenResolve(res);

  const client = new YouMailClient('the api key', 'the api sid');
  const result = await client.lookup('caller phone number');

  t.true(result.ok);
  t.is(result.spamRisk, res.spamRisk.level);
});

test.serial('returns undefined spamRisk when the API record is not found', async t => {
  const res: ApiResponse = {
    statusCode: StatusCode.SuccessfulQuery,
    recordFound: false,
    timestamp: 'the timestamp'
  };

  td.when(
    sendRequest(td.matchers.contains({ callerNumber: 'caller phone number' }))
  ).thenResolve(res);

  const client = new YouMailClient('the api key', 'the api sid');
  const result = await client.lookup('caller phone number');

  t.true(result.ok);
  t.is(result.spamRisk, undefined);
});

test.serial('raw API result is passed through', async t => {
  const res: ApiResponse = {
    statusCode: StatusCode.SuccessfulQuery,
    recordFound: false,
    spamRisk: { level: 1 },
    timestamp: 'the timestamp'
  };

  td.when(
    sendRequest(td.matchers.contains({ callerNumber: 'caller phone number' }))
  ).thenResolve(res);

  const client = new YouMailClient('the api key', 'the api sid');
  const result = await client.lookup('caller phone number');

  t.deepEqual(result.raw, res);
});

test.serial('sets properties appropriately when an error is returned', async t => {
  const res: ApiResponse = {
    statusCode: StatusCode.InternalError,
    recordFound: false,
    errors: [],
    timestamp: 'the timestamp'
  };

  td.when(
    sendRequest(td.matchers.contains({ callerNumber: 'caller phone number' }))
  ).thenResolve(res);

  const client = new YouMailClient('the api key', 'the api sid');
  const result = await client.lookup('caller phone number');

  t.false(result.ok);
  t.is(result.spamRisk, undefined);
});

test.serial('queries the normalized version of the phone number', async t => {
  const res: ApiResponse = {
    statusCode: StatusCode.InternalError,
    recordFound: true,
    spamRisk: { level: 2 },
    timestamp: 'the timestamp'
  };

  td.when(sendRequest(td.matchers.contains({ callerNumber: '2068671234' }))).thenResolve(
    res
  );

  const client = new YouMailClient('the api key', 'the api sid');
  const result = await client.lookup('+1 (206) 867-1234');

  t.false(result.ok);
  t.is(result.spamRisk, res.spamRisk.level);
});

test.serial('doesn’t normalize invalid phone numbers', async t => {
  const res: ApiResponse = {
    statusCode: StatusCode.InternalError,
    recordFound: false,
    spamRisk: { level: 2 },
    timestamp: 'the timestamp'
  };

  td.when(
    sendRequest(td.matchers.contains({ callerNumber: 'not a valid phone number' }))
  ).thenResolve(res);

  const client = new YouMailClient('the api key', 'the api sid');
  const result = await client.lookup('not a valid phone number');

  t.false(result.ok);
  t.is(result.spamRisk, undefined);
});

test.serial('calledNumber is normalized and passed through', async t => {
  const res: ApiResponse = {
    statusCode: StatusCode.InternalError,
    recordFound: true,
    spamRisk: { level: 2 },
    timestamp: 'the timestamp'
  };

  td.when(sendRequest(td.matchers.contains({ calledNumber: '2068671234' }))).thenResolve(
    res
  );

  const client = new YouMailClient('the api key', 'the api sid');
  const result = await client.lookup({
    callerNumber: '206-867-5309',
    calledNumber: '+1 (206) 867-1234'
  });

  t.false(result.ok);
  t.is(result.spamRisk, res.spamRisk.level);
});

test.serial('calledNumber is not normalized if it isn’t valid', async t => {
  const res: ApiResponse = {
    statusCode: StatusCode.InternalError,
    recordFound: true,
    spamRisk: { level: 2 },
    timestamp: 'the timestamp'
  };

  td.when(sendRequest(td.matchers.contains({ calledNumber: 'not valid' }))).thenResolve(
    res
  );

  const client = new YouMailClient('the api key', 'the api sid');
  const result = await client.lookup({
    callerNumber: '206-867-5309',
    calledNumber: 'not valid'
  });

  t.false(result.ok);
  t.is(result.spamRisk, res.spamRisk.level);
});

test.serial('callerId is passed through', async t => {
  const res: ApiResponse = {
    statusCode: StatusCode.InternalError,
    recordFound: true,
    spamRisk: { level: 2 },
    timestamp: 'the timestamp'
  };

  td.when(sendRequest(td.matchers.contains({ callerId: 'JUST TESTING' }))).thenResolve(
    res
  );

  const client = new YouMailClient('the api key', 'the api sid');
  const result = await client.lookup({
    callerNumber: '206-867-1234',
    callerId: 'JUST TESTING'
  });

  t.false(result.ok);
  t.is(result.spamRisk, res.spamRisk.level);
});
