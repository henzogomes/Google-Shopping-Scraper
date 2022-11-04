import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config({ path: '../.env' })

export default function(to, subject, body) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS
    }
  });

  var mailOptions = {
    from: process.env.EMAIL,
    to: to,
    subject: subject,
    html: body
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}