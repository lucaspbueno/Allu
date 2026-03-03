import pino from "pino";

const SERVICE_NAME = "cart-service";

const streams: pino.StreamEntry[] = [{ stream: process.stdout }];
if (process.env.LOG_FILE) {
  streams.push({
    stream: pino.destination({
      dest: process.env.LOG_FILE,
      append: true,
      mkdir: true,
    }),
  });
}

export const logger = pino(
  {
    name: SERVICE_NAME,
    level: process.env.LOG_LEVEL || "info",
    formatters: {
      level: (label) => ({ level: label }),
    },
  },
  pino.multistream(streams)
);
