import { Client } from "@xmtp/xmtp-js";
import dotenv from "dotenv";
import { Wallet } from "ethers";
import { sendEmail } from "./email.js";
import { getRedisClient } from "./redis.js";
dotenv.config();

const signer = new Wallet(process.env.PK);

const msg = `Hello! 👋 Here's your personalized daily update. We hope you find it valuable and insightful. If you have any questions or feedback, please don't hesitate to reach out. Have a great day! 😊`;
const schedule = async () => {
  const redisClient = await getRedisClient();
  const keys = await redisClient.keys("*");
  const values = (await redisClient.mGet(keys)).map((value) =>
    JSON.parse(value)
  );
  const emails = [...new Set(values.map((value) => value.email))];
  const xmtpClient = await Client.create(signer, { env: "production" });
  console.log("xmtpClient", emails);
  const conversations = await Promise.all(
    keys.map((address) => xmtpClient.conversations.newConversation(address))
  );
  await Promise.all(
    conversations.map((conversation) =>
      conversation
        .send(msg)
        .catch((error) =>
          console.error(
            `Failed to send message to ${conversation.peerAddress}:`,
            error
          )
        )
    )
  );
  console.log("Sending emails to:", emails);
  await sendEmail({ email: emails, msg });
};
schedule();
