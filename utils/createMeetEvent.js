import { google } from "googleapis";
import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";

async function createMeetEvent({
  doctorName,
  dateTime,
  patientEmail,
  doctorEmail,
  googleRefreshToken
}) {
  console.log('payload',doctorName,dateTime,patientEmail,doctorEmail,googleRefreshToken)
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.OAUTH_REDIRECT_URI
    );
    console.log('oauthclient instance',oauth2Client)

    oauth2Client.setCredentials({ refresh_token: googleRefreshToken });

    console.log('client credential set')

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    console.log('calender instance created')

    const endDate = dayjs(dateTime).add(30, "minute").toISOString();

    const event = {
      summary: "Doctor Consultation",
      description: `Online consultation with Dr. ${doctorName}`,
      start: { dateTime, timeZone: "Asia/Karachi" },
      end: { dateTime: endDate, timeZone: "Asia/Karachi" },
      attendees: [
        { email: patientEmail },
        { email: doctorEmail },
      ],
      conferenceData: {
        createRequest: {
          requestId: uuidv4(),
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };

    console.log('event created')

    const insertRes = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: "all",
    });

    return (
      insertRes.data?.conferenceData?.entryPoints?.find(
        (e) => e.entryPointType === "video"
      )?.uri || null
    );
  } catch (error) {
    console.error("Error creating Meet event:", error);
    throw error;
  }
}

export default createMeetEvent;