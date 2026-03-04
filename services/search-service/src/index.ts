import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import swaggerUi from "swagger-ui-express";
import openApiSpec from "./openapi.json";
import { logger } from "./lib/logger";
import { searchRoutes } from "./routes/search.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));
app.use("/search", searchRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "search-service" });
});

export { app };

if (process.env.NODE_ENV !== "test") {
  const PORT = Number(process.env.SEARCH_PORT) || 3003;

  app.listen(PORT, () => {
    logger.info({ port: PORT }, "Search service listening");
  });
}
