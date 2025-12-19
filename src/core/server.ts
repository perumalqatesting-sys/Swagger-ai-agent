import http from "http";
import createApp from "./app";
import logger from "../infrastructure/logging/winston.logger";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = createApp();
const server = http.createServer(app);

server.listen(PORT, () => {
  logger.info(`Swagger AI Agent listening on port ${PORT}`);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down");
  server.close(() => process.exit(0));
});

export default server;
