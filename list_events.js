const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
var auth_func = require('./auth_function');
// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
//const TOKEN_PATH = './token.json';
var single_event_data = {
    number: 0,
    start: "",
    end: "",
    timestamp: 0,
    summary: "",
    creator: "",
    email: ""
}
var all_events = []
var calendars_array = []

read_cal_lines(function (err, content) {
    //console.log("In read_cal_lines")
    //console.log("Calendars to check: " + content)
    if (err) {
    }
    //console.log("End read_cal_lines")
})
function read_cal_lines(callback) {
    //console.log("read_cal_lines")
    const readInterface = readline.createInterface({
        input: fs.createReadStream('./calendars.txt'),
        //output: process.stdout,
        console: false,
    })
    //console.log("OK")    

    readInterface.on('line', function(line) {
        if (line.charAt(0) != "#") { 
            //console.log("line: " + line)
            calendars_array.push(line)
        }
    });
}

read_creds(function (err, content) {
    //console.log("In read_creds")
    //console.log("Token: " + content)
    if (err) {
    }
})

function loop_through_calendars(oAuth2Client){
    //console.log("In loop_through_calendars")
    //console.log(calendars_array.length)

// Loop through all cals and check when no of checked equals count c from read_cal_lines 
    for (x = 0; x < calendars_array.length; x++) {
        var act_cal = calendars_array[x].split(',')
        //console.log(act_cal[1])
        list_events(act_cal[1], oAuth2Client)
    }
}

function list_events(curr_cal_id, auth){
    //console.log("list events")
    const calendar = google.calendar({ version: 'v3', auth });
    calendar.events.list({
        calendarId: curr_cal_id,
        timeMin: (new Date()).toISOString(),
        maxResults: 5,
        singleEvents: true,
        orderBy: 'startTime',
    }, (err, res) => {
        if (err)
            return console.log('The API returned an error: ' + err);
        const events = res.data.items;
        //console.log(events)
        //console.log("No of events: " +events.length)
        if (events.length) {
            //console.log('Upcoming events:');
            events.map((event, i) => {
                const start = event.start.dateTime || event.start.date;
                const end = event.end.dateTime || event.end.date;
                var timestamp = Date.parse(start);   // Timestamp for sorting
                single_event_data.number = i
                single_event_data.start = start
                single_event_data.end = end
                single_event_data.timestamp = timestamp
                single_event_data.summary = event.summary
                single_event_data.creator = event.creator.email
                single_event_data.displayName = event.creator.displayName
                single_event_data.email = event.creator.email
                oneevent = collectEvents(single_event_data);
            });
          } else {
            console.log('No upcoming events found.');
          }       
          
          all_events.sort((a, b) => a.time - b.time)

          all_events.forEach(element => {
              console.log(element)
          });
          //console.log("Done")
        }
        )
    }


function collectEvents(data) {
    one_event = {
        "time":data.timestamp,
        "data": {
          "summary":data.summary,
          "start":data.start,
          "end":data.end,
          "creator":data.displayName,
          "email": data.email
        }
       }
    all_events.push(one_event)
}   

function read_creds(){
    fs.readFile('./credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        auth_func.auth(JSON.parse(content), loop_through_calendars);        
    });
}