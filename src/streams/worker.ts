import Redis from "ioredis";
import {
  REDIS_URL,
  GROUP_NAME_1,
  CONSUMER_NAME_1,
  STREAM_NAME_1,
  STREAM_NAME_2,
} from "./contract.js";

async function listenToStream1() {
  const sub = new Redis(REDIS_URL);
  const pub = new Redis(REDIS_URL);

  while (true) {
    try {
      const message: any = await sub.xreadgroup(
        "GROUP",
        GROUP_NAME_1,
        CONSUMER_NAME_1,
        "COUNT",
        1, // Takes only one message at a time
        "BLOCK",
        0, // It waits forever for new messages
        "STREAMS",
        STREAM_NAME_1,
        ">" // Takes only new messages (not handled or pending)
      );

      const index = message[0][1][0][0];
      const key = message[0][1][0][1][1];

      if (key === "EXIT") {
        process.exit(0);
      }

      await pub.xadd(STREAM_NAME_2, "MAXLEN", "~", 100, "*", "key", key);

      await sub.xack(STREAM_NAME_1, GROUP_NAME_1, index);
    } catch (e) {}
  }
}

async function main() {
  void listenToStream1();
}

void main();
