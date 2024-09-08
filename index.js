import { Client } from "@xmtp/xmtp-js";
import dotenv from "dotenv";
import { Wallet } from "ethers";
import { sendEmail } from "./email.js";
import { getRedisClient } from "./redis.js";
dotenv.config();

const signer = new Wallet(process.env.PK);

const xmtpMsg =
  "Hey, it's David Goggins! I'm here to help you crush your fitness goals. Are you ready to push yourself and get after it?";

const msg = (email) => `
  <h1 style="color: green;">Hello ${email},</h1>
  <p>� Hey, it's <strong>David Goggins</strong>! I'm here to help you crush your fitness goals. Are you ready to push yourself and get after it?</p>
  <p>You've made the right decision by subscribing to us. Together, we're going to achieve greatness!</p>
  <p>With me by your side, you won't miss out on personalized workout plans, tips, and one-on-one coaching. This is your time to dominate!</p>
  <p><a href="https://getfit-chatbot.vercel.app/membership" style="color: #ffffff; background-color: #28a745; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Start Training Now!</a></p>
  
  <!-- Video Embed -->
  <div style="text-align: center;">
    <iframe width="560" height="315" src="https://www.youtube.com/embed/6_uvpReICDU?list=PLm68O2x9d3b28QLfrINbimcWSc0CrT0Rb" title="Train with David Goggins" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
  </div>
  
  <p>Stay fit, stay motivated, and keep grinding. Can't wait to see you on the battlefield of fitness!</p>
  <p>Cheers,<br>The getFit Team �️‍♂️</p>
`;

const schedule = async () => {
  const redisClient = await getRedisClient();
  const keys = await redisClient.keys("*");
  const values = await Promise.all(
    keys.map(async (key) => {
      const value = await redisClient.get(key);
      const parsedValue = JSON.parse(value);
      return { ...parsedValue, address: key };
    })
  );
  const xmtpClient = await Client.create(signer, { env: "production" });
  await Promise.all(
    values.map((value) =>
      xmtpClient.conversations
        .newConversation(value.address)
        .then(async (conversation) => {
          conversation
            .send(xmtpMsg)
            .then(async (response) => {
              await sendEmail({ email: value.email, msg: msg(value.email) });
            })
            .catch((error) =>
              console.error(
                `Failed to send message to ${conversation.peerAddress}:`,
                error
              )
            );
        })
    )
  );
};
schedule();
