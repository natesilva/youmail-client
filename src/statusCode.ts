/** A status code returned by the YouMail API. */
export enum StatusCode {
  // Success codes (10xxx)

  /** We were able to retrieve the data you requested. */
  SuccessfulQuery = 10000,
  /** We were able to process the data you submitted. */
  SuccessfulUpdate = 10100,

  // Payment error codes (20xxx)

  /** General payment error not covered by other codes. */
  PaymentError = 20000,
  /** Your credit balance was not sufficient to complete the request. */
  InsufficientBalance = 20100,
  /** The card provided for this payment has expired. */
  CreditCardExpired = 20200,
  /** The card provided for this payment was declined by the processing agency or bank. */
  CreditCardDeclined = 20300,

  // Authentication and authorization error codes (30xxx)

  /** General authorization error not covered by other codes. */
  AuthorizationError = 30000,
  /** Your account does not have permission to access the requested data module. */
  NoDataModulePermission = 30100,
  /** The username and password supplied were incorrect. */
  InvalidCredentials = 30200,
  /** The auth token provided has expired. Your client must re-authenticate to access the API. */
  AuthTokenExpired = 30300,
  /** The auth token provided is not recognized. */
  AuthTokenInvalid = 30400,
  /** There was no auth token provided in the request. */
  AuthTokenMissing = 30500,

  // Request error codes (40xxx)

  /** General request error not covered by other codes. */
  RequestError = 40000,
  /** The request was in an invalid format and could not be processed. */
  RequestFormatError = 40100,

  // Internal error codes (50xxx)

  /** General internal error not covered by other codes. */
  InternalError = 50000,
  /** We were unable to process your request in an acceptable time frame. */
  RequestTimedOut = 50100
}
