# @reallyuseful/youmail-client

[![npm](https://img.shields.io/npm/v/@reallyuseful/youmail-client.svg)](https://www.npmjs.com/package/@reallyuseful/youmail-client) [![dependencies](https://img.shields.io/david/natesilva/youmail-client.svg)](https://www.npmjs.com/package/@reallyuseful/youmail-client) [![license](https://img.shields.io/github/license/natesilva/youmail-client.svg)](https://github.com/natesilva/youmail-client/blob/master/LICENSE) [![node](https://img.shields.io/node/v/@reallyuseful/youmail-client.svg)](https://www.npmjs.com/package/@reallyuseful/youmail-client)

**A Node.js interface for the YouMail Spam Caller API (Unofficial)**

Use the [YouMail Spam Caller API](https://data.youmail.com/) to determine if an incoming
phone call is likely to be a spammer.

```javascript
const { YouMailClient } = require('@reallyuseful/youmail-client');

async function main() {
  const client = new YouMailClient('your api key', 'your api sid');

  // simple lookup
  let result = await client.lookup('caller phone number');

  // advanced lookup (passing in caller ID and/or callee)
  result = await client.lookup({
    callerNumber: 'caller phone number',
    callerId: 'caller’s caller ID',
    calledNumber: 'callee phone number'
  });

  console.log(result.ok); // true if the request succeeded

  console.log(result.spamRisk);
  // 0 = not a spammer
  // 1 = possible spam
  // 2 = highly likely to be spam
  // undefined = no record found

  console.log(result.raw);
  // the full response from YouMail:
  // {
  //   "statusCode": 10000,
  //   "recordFound": true,
  //   "phoneNumber": 9991002000,
  //   "spamRisk": { "level": 1 },
  //   "timestamp": "2016-10-06T00:31:04.362Z"
  // }
}

main();
```
