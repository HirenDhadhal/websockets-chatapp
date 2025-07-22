import { Kafka, Producer } from "kafkajs";
import fs from "fs";
import path from "path";
import prismaClient from "../db/db";
require("dotenv").config();

interface ChatEvent {
  type: "chat" | "join" | "asktojoin";
  payload: any;
}

interface MessagePayload {
  chatId: number;
  email: string;
  text: string;
  timestamp: string;
}

interface JoinRoomPayload {
  chatId: number;
  userEmail: string;
}

const kafka = new Kafka({
  brokers: [process.env.KAFKA_BROKER!],
  ssl: {
    ca: [fs.readFileSync(path.resolve("./src/ca.pem"), "utf8")],
  },
  sasl: {
    username: process.env.KAFKA_USERNAME!,
    password: process.env.KAFKA_PASSWORD!,
    mechanism: "plain",
  },
});

let producer: Producer | null = null;

export async function createProducer() {
  if (producer !== null) return producer;

  const _producer = kafka.producer();
  await _producer.connect();
  producer = _producer;
  return producer;
}

export async function produceMessage(message: string) {
  const producer = await createProducer();
  producer.send({
    messages: [{ key: `message:${Date.now()}`, value: message }],
    topic: "MESSAGES",
  });
}

export async function startMessageConsumer() {
  console.log("Kafka Consumer is running..");
  const consumer = kafka.consumer({ groupId: "default" });
  await consumer.connect();
  await consumer.subscribe({ topic: "MESSAGES", fromBeginning: true });

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message, heartbeat }) => {
      if (!message.value) return;

      try {
        const data: ChatEvent = JSON.parse(message.value!.toString());

        if (data.type === "join") {
          const payload: JoinRoomPayload = data.payload;
          const userEmail = payload.userEmail;
          const chatId = payload.chatId;

          try {
            //Only add the entry in DB if it is not already present
            await prismaClient.$executeRaw`
            INSERT INTO "ChatUserMapping" ("userEmail", "chatId")
            VALUES (${userEmail}, ${chatId})
            ON CONFLICT ("userEmail", "chatId") DO NOTHING
          `;
          } catch (err) {
            console.error("Error adding JOIN event in Database: " + err);
          }
        } else if (data.type === "chat") {
          const payload: MessagePayload = data.payload;

          try {
            await prismaClient.chatMessages.create({
              data: {
                text: payload.text,
                ChatId: payload.chatId,
                userEmail: payload.email,
                sentAt: payload.timestamp,
              },
            });
          } catch (err) {
            console.error("Error adding CHAT event in Database: " + err);
          }
        }

        //only commit if DB is up
        await consumer.commitOffsets([
          {
            topic,
            partition,
            offset: (Number(message.offset) + 1).toString(),
          },
        ]);

        await heartbeat();
      } catch (err) {
        console.error("Error saving message to DB:", err);

        // pause the consumer and retry after 15min
        consumer.pause([{ topic }]);
        setTimeout(() => {
          consumer.resume([{ topic }]);
        }, 15000);
      }
    },
  });
}

export default kafka;
