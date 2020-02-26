
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = './token.json';

fs.readFile('./credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);

authorize(JSON.parse(content), listCalendars);        
});

function listCalendars(auth) {
    const calendar = google.calendar({version: 'v3', auth});
    let params = {
        showHidden: true
      };
      
      calendar.calendarList.list(params)
        .then(resp => {
          var respons = resp.data.items
          console.log("Found " + respons.length + " calendars:")
          for (x = 0 ; x<respons.length ; x++)
          {
            var res = respons[x].id
            console.log(res)
          }
        }).catch(err => {
          console.log(err.message);
        });
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
  