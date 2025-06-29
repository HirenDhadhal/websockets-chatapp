import { Kafka, Producer } from "kafkajs";
import fs from "fs";
import path from "path";
import prismaClient from '../db/db'
require("dotenv").config();

interface Message {
  chatId: number;
  //TODO
  // senderId: userID,
  text: string;
  timestamp: number;
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
    messages: [{ key: `message${Date.now()}`, value: message }],
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
      console.log(`New Message Recv..`);

      try {
        const data:Message = JSON.parse(message.value!.toString());

        await prismaClient.chatMessages.create({
          data: {
            text: data.text,
            ChatId: data.chatId,
            userId: 1,  //TODO => Update the userID
            timestamp: data.timestamp
          }
        });

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
