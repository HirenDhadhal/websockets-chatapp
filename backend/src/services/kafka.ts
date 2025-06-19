import { Kafka, Producer } from "kafkajs";
import fs from "fs";
import path from "path";
require("dotenv").config();

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
    autoCommit: true,
    eachMessage: async ({ message, pause }) => {
      if (!message.value) return;
      console.log(`New Message Recv..`);
      try {
        // await prismaClient.message.create({
        //   data: {
        //     text: message.value?.toString(),
        //   },
        // });
      } catch (err) {
        console.log("Something is wrong");
        pause();
        setTimeout(() => {
          consumer.resume([{ topic: "MESSAGES" }]);
        }, 60 * 1000);
      }
    },
  });
}

export default kafka;
