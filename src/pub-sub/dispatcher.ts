import { Redis } from "ioredis";
import { CHANNEL_1, CHANNEL_2, REDIS_URL } from "./contract.js";
import { v4 } from "uuid";
import { Monitor } from "../monitor.js";
import { MESSAGE_INTERVAL, SAMPLING_TIME } from "../config.js";

const monitor = new Monitor("Redis Pub/Sub");

const pub = new Redis(REDIS_URL);

function publish() {
  setInterval(async () => {
    const key = v4();

    monitor.addMessage(key);

    await pub.publish(CHANNEL_1, key);
  }, MESSAGE_INTERVAL);
}

function listen() {
  const sub = new Redis(REDIS_URL);

  sub.subscribe(CHANNEL_2, (err, count) => {
    if (err) {
      console.error("Failed to subscribe: %s", err.message);
    }
  });

  sub.on("message", async (_, key) => {
    monitor.reportMessageReturned(key);
  });

  setTimeout(async () => {
    monitor.reportResults();
    await pub.publish(CHANNEL_1, "EXIT");
    process.exit(0);
  }, SAMPLING_TIME);
}

async function main() {
  publish();
  listen();
}

void main();
