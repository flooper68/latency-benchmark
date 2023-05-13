import { Worker, isMainThread, parentPort } from "node:worker_threads";
import { v4 } from "uuid";
import { Monitor } from "../monitor.js";
import { MESSAGE_INTERVAL, SAMPLING_TIME } from "../config.js";

const monitor = new Monitor("Worker Threads");

function handleMessage() {
  parentPort?.on("message", (key) => {
    parentPort?.postMessage(key);
  });
}

function main() {
  const __filename = new URL("", import.meta.url).pathname;

  const worker = new Worker(__filename);

  worker.on("message", (key) => {
    monitor.reportMessageReturned(key);
  });

  setInterval(() => {
    const key = v4();

    monitor.addMessage(key);

    worker.postMessage(key);
  }, MESSAGE_INTERVAL);

  setTimeout(() => {
    monitor.reportResults();
    process.exit(0);
  }, SAMPLING_TIME);
}

if (isMainThread) {
  main();
} else {
  handleMessage();
}
