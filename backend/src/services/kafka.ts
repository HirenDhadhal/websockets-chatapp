import { Kafka, Producer } from "kafkajs";
import fs from "fs";
import path from "path";
import prismaClient from "../db/db";
require("dotenv").config();

interface ChatEvent {
  type: "chat" | "join";
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
  console.log("Consumer is running..");
  const consumer = kafka.consumer({ groupId: "default" });
  await consumer.connect();
  await consumer.subscribe({ topic: "MESSAGES", fromBeginning: true });

  await consumer.run({
    autoCommit: false,
    eachMessage: async ({ topic, partition, message, heartbeat }) => {
      if (!message.value) return;

      try {
        const data: ChatEvent = JSON.parse(message.value!.toString());

        if (data.type == "join") {
          const payload: JoinRoomPayload = data.payload;

          try {
            await prismaClient.chatUserMapping.create({
            data: {
              chatId: payload.chatId,
              userEmail: payload.userEmail,
            },
          });
          } catch (err) {
            console.error('Error adding JOIN event in Database: ' + err);
          }
        } else {
          //Type = 'chat'
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
            console.error('Error adding CHAT event in Database: ' + err);
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
