// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

const twitterScopes = ["tweet.read", "tweet.write", "users.read", "follows.read", "follows.write", "offline.access", "like.read", "like.write"];
const clientId = "RmJoOGFLSm85TkdoZXpCWmlFN246MTpjaQ";
const redirectUri = "http://127.0.0.1:8100/twitter/oauth";

export const environment = {
  production: false,
  twitterClientId: "RmJoOGFLSm85TkdoZXpCWmlFN246MTpjaQ",
  twitterClientSecret: "ItnTSYLvQfg0mrxf24hP3AaC9kUWE7faNaDVSiFqSH8wrQuDlP",
  twitterScopes,
  twitterEndpoint: 'https://api.twitter.com/2/oauth2',
  twitterAuthUrl: 'https://twitter.com/i/oauth2/authorize?response_type=code' +
                  `&client_id=${clientId}` +
                  `&redirect_uri=${redirectUri}` +
                  `&scope=${encodeURIComponent(twitterScopes.join(" "))}` +
                  "&code_challenge=:CODE_CHALLENGE" +
                  "&state=:STATE" +
                  "&code_challenge_method=plain",
  tempStoragePath: "twittonic_temp",
  storagePath: 'twittonic',
  successRedirectUri: "http://127.0.0.1:8100/twitter/oauth",
  backendEndpoint: "http://127.0.0.1:3001/2"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
