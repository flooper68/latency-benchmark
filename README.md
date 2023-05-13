## Latency benchmark

This packages is just a simple benchmark between different ways of communications in parallel computations. The benchmark measures sending message to some worker and waiting for a response.

- Nodejs Child Processes
- Nodejs Worker Threads
- Redis Pub/Sub
- Redis Streams

To run the benchmark install the packages, run docker-compose and `npm run start`.

To configure the benchmark parameters, tweak the config.ts file.

## Observations

General

- All methods get faster with higher message rate
- Tested on M1 air

Child processes

- ~ 0.45ms in low message rate scenarios, ~ 0.25ms in very high rate

- Worker threads

- ~ 0.2ms in low message rate scenarios, ~ 0.13ms in very high rate

Redis Pub/Sub

- ~ 2.3ms in low message rate scenarios, ~ 3ms in very high rate

Redis Streams

- ~ 4.6ms in low message rate scenarios, ~ 2ms in very high rate
