import {google} from "googleapis";
import dotenv from "dotenv"

dotenv.config()

const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// directly adding refresh token as this is test

if (process.env.REFRESH_TOKEN){
    oAuth2Client.setCredentials({refresh_token: process.env.REFRESH_TOKEN})
}

export default oAuth2Client;