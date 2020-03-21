// This reads events from the primary calender.
// You'll have to authorize before you use it.

const fs = require('fs');
const {google} = require('googleapis');
const TOKEN_PATH = 'token.json';

function loadCreds () {
    return new Promise((resolve, reject) => {
        fs.readFile('credentials.json', (err, content) => {
        if (err) {
            reject(err)
        }    
        resolve(JSON.parse(content))    
    })
    });
  }

function auth(credentials) {
    return new Promise((resolve, reject) => {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
        fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) reject(TokenError())
        oAuth2Client.setCredentials(JSON.parse(token));
        if (err) {
            reject(err)
        }    
        resolve(oAuth2Client)    
    })
  })
}

function eventlist(auth) {
    return new Promise((resolve, reject) => {
        const calendar = google.calendar({version: 'v3', auth});
        calendar.events.list({
            calendarId: 'primary',
            timeMin: (new Date()).toISOString(),
            maxResults: 10,
            singleEvents: true,
            orderBy: 'startTime',
        }, (err, res) => {
            const events = res.data.items;
            if (events.length) {
                resolve(events)
            }
            else if(err) reject("API error" + err)            
            }
        )
    })
}
  
(async function(){
    var creds = await loadCreds()  
    var oauth = await auth(creds)
    var events = await eventlist(oauth)
    events.map((event, i) => {
        const start = event.start.dateTime || event.start.date;
        console.log(`${start} - ${event.summary}`);
      });
  })()
