const express = require('express');
const admin = require('firebase-admin');
const { google } = require('googleapis');

const app = express();
const port = 3000;

// Initialize Firebase Admin SDK with your service account
const serviceAccount = require('./fcm_key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Obtain OAuth2 client to generate access token
const scopes = ['https://www.googleapis.com/auth/firebase.messaging'];
const jwtClient = new google.auth.JWT(
  serviceAccount.client_email,
  null,
  serviceAccount.private_key,
  scopes
);

// Function to get access token
async function getAccessToken() {
  try {
    const tokenResponse = await jwtClient.getAccessToken();
    return tokenResponse.token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

// Endpoint to send FCM message to a device using HTTP v1 API
app.get('/', async (req, res) => {
  try {
    // Get access token
    const accessToken = await getAccessToken();

    // FCM message payload targeting a specific device
    const message = {
      token: 'fgdV15AoTqefIAIC7rCxl3:APA91bFudpB9ln5WQ0MT_6jcU9poJeYxc9Kh5JuR46fN_12nwStnkwWgZZme27nkljJIQk5MVlUxlBNn3J-hxHgJw-PL63T_scoOk9i_dKMQChuD_Y6yTmvuaxc1cllGSrw3rNtjJ_fe',
      notification: {
        title: 'Hello Title',
        body: 'Hello Body'
      },
      android: {
        notification: {
          click_action: 'TOP_STORY_ACTIVITY'
        }
      },
      apns: {
        payload: {
          aps: {
            category: 'NEW_MESSAGE_CATEGORY'
          }
        }
      }
    };

    // Send the message
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    res.status(200).send('Message sent successfully');
  } catch (error) {
    console.error('Error sending message:', error.message);
    res.status(500).send('Error sending message');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
