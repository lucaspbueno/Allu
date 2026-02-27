import express from "express";
import pino from "pino";
import pinoHttp from "pino-http";
import swaggerUi from "swagger-ui-express";
import openApiSpec from "./openapi.json";

const SERVICE_NAME = "search-service";
const PORT = Number(process.env.PORT) || 3002;

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

const logger = pino(
  {
    name: SERVICE_NAME,
    level: process.env.LOG_LEVEL || "info",
    formatters: {
      level: (label) => ({ level: label }),
    },
  },
  pino.multistream(streams)
);

const app = express();
app.use(express.json());
app.use(pinoHttp({ logger }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: SERVICE_NAME });
});

export { app };

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    logger.info({ port: PORT }, "Search service listening");
  });
}
