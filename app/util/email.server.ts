import aws from 'aws-sdk';
import Sentry from '@sentry/node';

const ses = new aws.SES({ region: 'us-east-1' });

export async function sendEmail(magicLink: String, email: String) {
  const params = {
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: `<p>Hi ${email}! Here's the magic link you requested to access the Pile of Shame app.</p>
<p><a href="${process.env.URL}/magic?magicWord=${magicLink}">Click here to login</a></p>
<p><i>You received this email because your email address was used to sign up for an account at <a href="${process.env.URL}">${process.env.URL}</a>. If you didn't sign up for an account, feel free to disregard and delete this email.</i></p>`,
        },
      },
      Subject: {
        Data: 'Magic Link Login for Pile of Shame',
      },
    },
    Source: 'noreply@klepinger.dev',
  };

  try {
    await ses.sendEmail(params).promise();
    return;
  } catch (err: any) {
    console.error(`Failed to send email: ${err.message}`);
    Sentry.captureException(err);
    throw err;
  }
}
