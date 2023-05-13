import { fork } from "node:child_process";
import { v4 } from "uuid";
import { Monitor } from "../monitor.js";
import { MESSAGE_INTERVAL, SAMPLING_TIME } from "../config.js";

const monitor = new Monitor("Child Process");

function main() {
  const __filename = new URL("./child.js", import.meta.url).pathname;

  const child = fork(__filename, [], {
    stdio: "inherit",
  });

  child.on("message", (key) => {
    monitor.reportMessageReturned(key.toString());
  });

  setInterval(() => {
    const key = v4();

    monitor.addMessage(key);

    child.send(key);
  }, MESSAGE_INTERVAL);

  setTimeout(() => {
    monitor.reportResults();
    process.exit(0);
  }, SAMPLING_TIME);
}

main();
