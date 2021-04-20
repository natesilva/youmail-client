import AbortController from 'abort-controller';
import fetch, { RequestInit, Response } from 'node-fetch';
import { URL } from 'url';
import { ApiResponse } from './apiResponse';
import util from './util';

const USER_AGENT = 'reallyuseful-youmail-client/1.0';

const YOUMAIL_SPAM_CALLER_API_URL = 'https://dataapi.youmail.com/api/v2/phone/';
console.assert(YOUMAIL_SPAM_CALLER_API_URL.endsWith('/'));

export interface ApiRequestOptions {
  apiSid: string;
  apiKey: string;
  callerNumber: string;
  callerId?: string;
  calledNumber?: string;
  /** abandon the request and reject with an error after this amount of time */
  timeoutMs?: number;
}

export async function sendRequest(options: ApiRequestOptions): Promise<ApiResponse> {
  const url = new URL(YOUMAIL_SPAM_CALLER_API_URL);
  url.pathname += options.callerNumber;
  url.searchParams.set('format', 'json');

  if (options.callerId) {
    url.searchParams.set('callerId', options.callerId);
  }

  if (options.calledNumber && util.isValidNorthAmericanNumber(options.calledNumber)) {
    url.searchParams.set('callee', options.calledNumber);
  }

  const req: RequestInit = {
    method: 'GET',
    headers: {
      'User-Agent': USER_AGENT,
      DataApiSid: options.apiSid,
      DataApiKey: options.apiKey,
    },
  };

  const controller = new AbortController();
  const signal = controller.signal;

  if (options.timeoutMs) {
    req.signal = signal;
    setTimeout(() => controller.abort(), options.timeoutMs);
  }

  let res: Response;

  try {
    res = await fetch(url.toString(), req);
    return res.json();
  } catch (error) {
    if (error.type === 'aborted') {
      throw new Error('The request was aborted');
    }
    throw error;
  }
}
