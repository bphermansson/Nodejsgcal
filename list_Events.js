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
var allEvents = []	// Array

fs.readFile('./credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    auth_func.auth(JSON.parse(content), readFile);        
});

function readFile(oAuth2Client){
    fs.readFile('./calendars.txt', (err, calendars_list) => {
        if (err) return console.log('Error loading calendar list file:', err);
        //cal_to_check = 5
        to_string = calendars_list.toString();
        split_lines = to_string.split("\n");
        var no_of_lines = split_lines.length-1
        console.log(no_of_lines + " lines found.");
        //console.log(split_lines[cal_to_check])
        for (var x = 0; x < no_of_lines; x++) {
            console.log(x)
            list_calendars(calendars_list, oAuth2Client, x)
        }
    });
}

function list_calendars(calendars_list, auth, cal_to_check){
    const calendar = google.calendar({ version: 'v3', auth });
    calendar.events.list({
        calendarId: split_lines[cal_to_check],
        timeMin: (new Date()).toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      }, (err, res) => {
        if (err)
          return console.log('The API returned an error: ' + err);
          const events = res.data.items;
  
        if (events.length) {
            for (var i = 0; i < events.length; i++) {
                var data = {};	// Object	
                data.summary = events[i].summary
                var startDT = events[i].start.dateTime
                if (typeof startDT === "undefined") { 
                    // All day event
                   // console.log("startDT undefined")
                    var start = events[i].start.date + "T00:00"    
                    var end = events[i].end.date + "T23:59"  
                    data.start = start 
                    data.end = end
                }
                else { 
                    data.start = events[i].start.dateTime
                    data.end = events[i].end.dateTime
                }
                data.email = events[i].creator.email
                allEvents.push(data)
                /*
                for (x in allEvents) {
                    console.log(allEvents[x]);
                }*/	
                jsonData = JSON.stringify(allEvents);
                console.log(jsonData);

            }
        }
        else {
          console.log('No upcoming events found.');
        }
      })}
    
