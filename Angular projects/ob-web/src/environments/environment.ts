// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  host: 'https://beta.dev.onlinebank.kz',
  baseUrl: 'https://public.test.onlinebank.kz/api',
  baseUrl2: 'https://public.test.onlinebank.kz',
  baseUrlForP2P: 'https://testp2p.onlinebank.kz', // TODO
  bbApi:
    'https://public.test.onlinebank.kz/api/document-gateway/document/guarantee',
  auth: {
    clientID: 'a8ff5273-0ba1-4955-8f07-36d62f91e653',
  },
  wsApiKey:
    'G3Nb58dn9kbPBX7AfrNp27gdrv22a0k/oHbHHxI0MnHVjeySB8DtpxCu+zZREqZSMQHGbbxL0A41eCIy9fKaJQ==',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
