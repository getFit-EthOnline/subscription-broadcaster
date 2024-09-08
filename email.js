import dotenv from "dotenv";
import { createTransport } from "nodemailer";
dotenv.config();

const transporter = createTransport({
  service: "gmail",
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASS,
  },
});

export const sendEmail = async ({ email, msg }) => {
  try {
    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: email,
      subject: `Welcome to the club`,
      html: `
                <h1 style="color: green;">${msg},</h1>
            `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};
