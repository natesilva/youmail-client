import { ApiResponse } from './apiResponse';
import { ApiRequestOptions, sendRequest } from './sendRequest';
import util from './util';

export interface LookupOptions {
  /** the caller’s phone number */
  callerNumber: string;
  /** the caller’s caller ID */
  callerId?: string;
  /** the callee (the phone number being called) */
  calledNumber?: string;
}

export interface LookupResult {
  /** true if the request completed successfully; false if an error occurred */
  ok: boolean;
  /**
   * if the record was found, the spam risk level; undefined if the record was not found
   */
  spamRisk?: number;
  /** the complete raw API response */
  raw: ApiResponse;
}

/**
 * If the given phone number is valid, format it as expected by the YouMail API.
 * Otherwise, return it unchanged.
 */
function formatNumberForYouMail(phoneNumber?: string) {
  if (!phoneNumber || !util.isValidNorthAmericanNumber(phoneNumber)) {
    return phoneNumber;
  }

  const e164 = util.formatPhoneNumber(phoneNumber);
  return e164.slice(2); // AAABBBCCCC (AAA = NPA, BBB = NXX, CCCC = Station)
}

/** Client for the YouMail Spam Caller (Big Data) API. */
export class YouMailClient {
  constructor(private readonly apiKey: string, private readonly apiSid: string) {}

  /**
   * Look up details about a phone number using the YouMail Spam Caller API.
   * @param options A LookupOptions object. For convenience, if you are only passing in
   *  the callerNumber, you can pass that as a string instead of a LookupOptions object.
   */
  async lookup(options: LookupOptions | string): Promise<LookupResult> {
    if (typeof options === 'string') {
      return this.lookup({ callerNumber: options });
    }

    // format the caller and called numbers as expected by the YouMail API
    const callerNumber = formatNumberForYouMail(options.callerNumber);
    const calledNumber = formatNumberForYouMail(options.calledNumber);

    const requestOptions: ApiRequestOptions = Object.assign({}, options, {
      callerNumber,
      calledNumber,
      apiSid: this.apiSid,
      apiKey: this.apiKey
    });

    const apiResponse = await sendRequest(requestOptions);

    const result = {} as LookupResult;
    result.raw = apiResponse;
    result.ok = apiResponse.statusCode >= 10000 && apiResponse.statusCode <= 10999;
    result.spamRisk =
      apiResponse.recordFound && apiResponse.spamRisk
        ? apiResponse.spamRisk.level
        : undefined;

    return result;
  }
}
