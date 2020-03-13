const {google} = require('googleapis');
const fs = require('fs');
const TOKEN_PATH = './token.json';

module.exports = {
    auth: function authorize(credentials, callback) {

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
};