import { strict as assert } from 'assert';
import { describe, it } from 'mocha';
import * as nock from 'nock';
import { posix } from 'path';
import * as td from 'testdouble';
import { URL } from 'url';
import * as sendRequestModule from './sendRequest';
import util from './util';

const apiUrl = new URL(sendRequestModule.YOUMAIL_SPAM_CALLER_API_URL);

describe('sendRequest', () => {
  afterEach(() => {
    td.reset();
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('makes a request to the expected url', async () => {
    nock(apiUrl.origin)
      .get(posix.join(apiUrl.pathname, 'the-caller-number'))
      .query({
        format: 'json',
      })
      .reply(200, JSON.stringify('the expectedUrl was fetched'));

    const result = await sendRequestModule.sendRequest({
      apiSid: 'the api sid',
      apiKey: 'the api key',
      callerNumber: 'the-caller-number',
    });

    assert.equal(result, 'the expectedUrl was fetched');
  });

  it('includes caller id in the url if passed', async () => {
    nock(apiUrl.origin)
      .get(posix.join(apiUrl.pathname, 'the-caller-number'))
      .query({
        format: 'json',
        callerId: 'the-caller-id',
      })
      .reply(200, JSON.stringify('the expectedUrl was fetched'));

    const result = await sendRequestModule.sendRequest({
      apiSid: 'the api sid',
      apiKey: 'the api key',
      callerNumber: 'the-caller-number',
      callerId: 'the-caller-id',
    });

    assert.equal(result, 'the expectedUrl was fetched');
  });

  it('includes callee in the url if a valid called number is passed', async () => {
    nock(apiUrl.origin)
      .get(posix.join(apiUrl.pathname, 'the-caller-number'))
      .query({
        format: 'json',
        callee: 'the-called-number',
      })
      .reply(200, JSON.stringify('the expectedUrl was fetched'));

    td.replace(util, 'isValidNorthAmericanNumber');
    td.when(util.isValidNorthAmericanNumber('the-called-number')).thenReturn(true);

    const result = await sendRequestModule.sendRequest({
      apiSid: 'the api sid',
      apiKey: 'the api key',
      callerNumber: 'the-caller-number',
      calledNumber: 'the-called-number',
    });

    assert.equal(result, 'the expectedUrl was fetched');
  });

  it('does not include callee in the url if an invalid called number is passed', async () => {
    nock(apiUrl.origin)
      .get(posix.join(apiUrl.pathname, 'the-caller-number'))
      .query({
        format: 'json',
      })
      .reply(200, JSON.stringify('the expectedUrl was fetched'));

    td.replace(util, 'isValidNorthAmericanNumber');
    td.when(util.isValidNorthAmericanNumber('the-called-number')).thenReturn(false);

    const result = await sendRequestModule.sendRequest({
      apiSid: 'the api sid',
      apiKey: 'the api key',
      callerNumber: 'the-caller-number',
      calledNumber: 'the-called-number',
    });

    assert.equal(result, 'the expectedUrl was fetched');
  });

  it('should reject if the request times out', async () => {
    nock(apiUrl.origin)
      .get(posix.join(apiUrl.pathname, 'the-caller-number'))
      .query({
        format: 'json',
      })
      .delay(1000)
      .reply(200, { data: 'the data' });

    const resultPromise = sendRequestModule.sendRequest({
      apiSid: 'the api sid',
      apiKey: 'the api key',
      callerNumber: 'the-caller-number',
      timeoutMs: 20,
    });

    await assert.rejects(resultPromise, /request was aborted/);
  });

  it('should not reject if the request does not time out', async () => {
    nock(apiUrl.origin)
      .get(posix.join(apiUrl.pathname, 'the-caller-number'))
      .query({
        format: 'json',
      })
      .delay(20)
      .reply(200, { data: 'the data' });

    const resultPromise = sendRequestModule.sendRequest({
      apiSid: 'the api sid',
      apiKey: 'the api key',
      callerNumber: 'the-caller-number',
      timeoutMs: 1000,
    });

    await assert.doesNotReject(resultPromise);
    assert.deepEqual(await resultPromise, { data: 'the data' });
  });
});
