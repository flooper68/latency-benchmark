import { Redis } from "ioredis";
import { CHANNEL_1, CHANNEL_2, REDIS_URL } from "./contract.js";

function listen() {
  const pub = new Redis(REDIS_URL);
  const sub = new Redis(REDIS_URL);

  sub.subscribe(CHANNEL_1, (err, count) => {
    if (err) {
      console.error("Failed to subscribe: %s", err.message);
    }
  });

  sub.on("message", async (channel, message) => {
    if (message === "EXIT") {
      process.exit(0);
    }

    await pub.publish(CHANNEL_2, message);
  });
}

async function main() {
  listen();
  setTimeout(() => {
    process.exit(0);
  }, 30000);
}

void main();
