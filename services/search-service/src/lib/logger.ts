import pino from "pino";

const SERVICE_NAME = "search-service";
const streams: pino.StreamEntry[] = [{ stream: process.stdout }];

if (process.env.LOG_FILE) {
  const fileStream = pino.destination({
    dest: process.env.LOG_FILE,
    append: true,
    mkdir: true,
  });
  fileStream.on("error", (err: Error) => {
    console.error(`Log file error: ${err.message}`);
  });
  streams.push({ stream: fileStream });
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
