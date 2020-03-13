const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
var auth_func = require('./auth_function');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = './token.json';

console.log(
    "Node.js script for authorization with Google Calendar.\nSee http://paheco.nu/?p=365 for more info"
    )

// Load client secrets from a local file.
fs.readFile('./credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Calendar API.
    auth_func.auth(JSON.parse(content), countCalendars);
})

function countCalendars(auth) {
    console.log("Counting calendars found to confirm you have access")
	  const calendar = google.calendar({version: 'v3', auth});
	  calendar.calendarList.list(
        { }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
               const cals = res.data.items;
                if (cals.length) {
                    console.log("No of calendars found: " + cals.length);
                    //console.log(cals);
            } else {
                console.log('No calendars found.');
            }
        }
   );
}

function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, (err, token) => {
            if (err) return getAccessToken(oAuth2Client, callback);
            oAuth2Client.setCredentials(JSON.parse(token));
            callback(oAuth2Client);
        });
  }

function getAccessToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return console.error(err);
          console.log('Token stored to', TOKEN_PATH);
        });
        callback(oAuth2Client);
      });
    });
}
