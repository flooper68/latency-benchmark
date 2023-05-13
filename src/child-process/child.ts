function sendMessage(message: string) {
  if (process.send == null) {
    throw new Error("Needs to be started as a child process");
  }

  process.send(message);
}

process.on("message", (key) => {
  sendMessage(`${key}`);
});
