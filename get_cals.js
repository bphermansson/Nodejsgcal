const fs = require('fs');
const {google} = require('googleapis');
var auth_func = require('./auth_function');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = './token.json';

fs.readFile('./credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);

    auth_func.auth(JSON.parse(content), listCalendars);        
});

function listCalendars(auth) {
    const calendar = google.calendar({version: 'v3', auth});
    let params = {
        showHidden: true
      };
      
      var calfile = "calendars.txt"

      // Make a copy of the old file

      fs.unlinkSync(calfile)    // Delete old file

      var calFiles = fs.createWriteStream(calfile, {
        flags: 'a' // 'a' means appending (old data will be preserved)
      })

      calendar.calendarList.list(params)
        .then(resp => {
          var respons = resp.data.items
          console.log("Found " + respons.length + " calendars:")
          //console.log(respons)  // All data
          for (x = 0 ; x<respons.length ; x++)
          {
            var id = respons[x].id        // Real id of calendar
            var name = respons[x].summary // Human readable name
            console.log(id)
            calFiles.write(name + "," + id + "\n")
          }
          calFiles.end()
          console.log("Calendar list written to " + calfile + ".\nRemove unwanted calendars manually or comment them out with \"#\"")
        }).catch(err => {
          console.log(err.message);
        });
}