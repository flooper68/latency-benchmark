export class Monitor {
  private readonly _messages = new Map<
    string,
    {
      start: number;
      end: number;
    }
  >();

  constructor(private readonly _name: string) {}

  addMessage(key: string) {
    this._messages.set(key, {
      start: performance.now(),
      end: performance.now(),
    });
  }

  reportMessageReturned(key: string) {
    const message = this._messages.get(key);

    if (message == null) {
      throw new Error(`Message with key ${key} not found`);
    }

    message.end = performance.now();
  }

  reportResults() {
    const average =
      Array.from(this._messages.values()).reduce(
        (acc, curr) => acc + (curr.end - curr.start),
        0
      ) / this._messages.size;

    const messages = this._messages.size;

    console.log(
      `[${this._name}] Average bounce back time after ${messages} messages sent is: ${average}`
    );
  }
}
