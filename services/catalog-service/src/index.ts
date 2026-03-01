import express from "express";
import pinoHttp from "pino-http";
import swaggerUi from "swagger-ui-express";
import openApiSpec from "./openapi.json";
import { logger } from "./lib/logger";
import { productRoutes } from "./routes/product.routes";

const app = express();

app.use(express.json());
app.use(pinoHttp({ logger }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.get("/health", (_req, res) => {
  const SERVICE_NAME = "catalog-service";

  res.status(200).json({ status: "ok", service: SERVICE_NAME });
});

app.use("/products", productRoutes);

export { app };

if (process.env.NODE_ENV !== "test") {
  const PORT = Number(process.env.PORT) || 3001;

  app.listen(PORT, () => {
    logger.info({ port: PORT }, "Catalog service listening");
  });
}
