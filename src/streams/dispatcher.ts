import { Redis } from "ioredis";
import { v4 } from "uuid";
import {
  REDIS_URL,
  GROUP_NAME_2,
  CONSUMER_NAME_2,
  STREAM_NAME_2,
  STREAM_NAME_1,
  GROUP_NAME_1,
} from "./contract.js";
import { Monitor } from "../monitor.js";
import { MESSAGE_INTERVAL, SAMPLING_TIME } from "../config.js";

const monitor = new Monitor("Redis Streams");

const pub = new Redis(REDIS_URL);
const sub = new Redis(REDIS_URL);

async function listenToStream2() {
  while (true) {
    try {
      const message: any = await sub.xreadgroup(
        "GROUP",
        GROUP_NAME_2,
        CONSUMER_NAME_2,
        "COUNT",
        1, // Takes only one message at a time
        "BLOCK",
        0, // It waits forever for new messages
        "STREAMS",
        STREAM_NAME_2,
        ">" // Takes only new messages (not handled or pending)
      );

      const index = message[0][1][0][0];
      const key = message[0][1][0][1][1];

      monitor.reportMessageReturned(key);

      await sub.xack(STREAM_NAME_1, GROUP_NAME_1, index);
    } catch (e) {}
  }
}

async function publish() {
  setInterval(async () => {
    const key = v4();
    monitor.addMessage(key);

    await pub.xadd(STREAM_NAME_1, "MAXLEN", "~", 100, "*", "key", key);
  }, MESSAGE_INTERVAL);
}

async function initStreams() {
  const client = new Redis(REDIS_URL);

  await client.flushall();

  try {
    await client.xgroup("CREATE", STREAM_NAME_1, GROUP_NAME_1, "$", "MKSTREAM");
  } catch (e) {}

  try {
    await client.xgroup("CREATE", STREAM_NAME_2, GROUP_NAME_2, "$", "MKSTREAM");
  } catch (e) {}
}

async function main() {
  await initStreams();

  void listenToStream2();
  void publish();

  setTimeout(async () => {
    monitor.reportResults();
    await pub.xadd(STREAM_NAME_1, "MAXLEN", "~", 100, "*", "key", "EXIT");
    process.exit(0);
  }, SAMPLING_TIME);
}

void main();
