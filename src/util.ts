import { PhoneNumberFormat, PhoneNumberUtil } from 'google-libphonenumber';

const phoneUtil = PhoneNumberUtil.getInstance();

export default class {
  /** Returns true if the input is a potentially-valid North American phone number. */
  static isValidNorthAmericanNumber(input: string) {
    try {
      const number = phoneUtil.parse(input, 'US');
      return number.getCountryCode() === 1 && phoneUtil.isValidNumber(number);
    } catch {
      return false;
    }
  }

  /**
   * Formats a phone number in standard E164 format. If it isn’t recognized as a phone
   * number, the input is returned unchanged.
   */
  static formatPhoneNumber(input: string) {
    try {
      const number = phoneUtil.parse(input, 'US');
      if (phoneUtil.isValidNumber(number)) {
        return phoneUtil.format(number, PhoneNumberFormat.E164);
      } else {
        return input;
      }
    } catch {
      return input;
    }
  }
}
