import { StatusCode } from './statusCode';

export interface ApiError {
  errorCode: string;
  shortMessage: string;
  longMessage: string;
}

export interface ApiResponse {
  /** 10000 indicates success. */
  statusCode: StatusCode;
  /**
   * true or false, indicating whether YouMail has sufficient data to make a spam risk
   * determination for this number.
   */
  recordFound: boolean;
  /** the phone number you queried. */
  phoneNumber?: string;
  spamRisk?: {
    /**
     * level: 0 = This number appears to be valid. 1 = This number appears to be a
     * spammer, but the data is inconclusive, so those concerned about false positives may
     * wish to accept calls from this number. 2 = There is very strong evidence that this
     * number is a spammer.
     */
    level: number;
  };
  errors?: ApiError[];
  /** The time at which the YouMail server generated this response. */
  timestamp: string;
}
