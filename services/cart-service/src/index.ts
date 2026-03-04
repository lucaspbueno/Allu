import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import swaggerUi from "swagger-ui-express";
import openApiSpec from "./openapi.json";
import { logger } from "./lib/logger";
import { cartRoutes } from "./routes/cart.routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger }));
app.use("/carts", cartRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "cart-service" });
});

export { app };

if (process.env.NODE_ENV !== "test") {
  const PORT = Number(process.env.CART_PORT) || 3001;

  app.listen(PORT, () => {
    logger.info({ port: PORT }, "Cart service listening");
  });
}
